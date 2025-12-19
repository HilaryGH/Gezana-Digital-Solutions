const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Service = require("../models/Service");
const Review = require("../models/Review");
const PremiumMembership = require("../models/PremiumMembership");
const Subscription = require("../models/Subscription");
const { getFileUrl } = require("../utils/fileHelper");

// Get provider duty status (public)
router.get("/duty-status/:providerId", async (req, res) => {
  try {
    const { providerId } = req.params;
    const user = await User.findById(providerId).select("isOnDuty");
    if (!user) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json({ isOnDuty: user.isOnDuty || false });
  } catch (error) {
    console.error("Error fetching public duty status:", error);
    res.status(500).json({ message: "Error fetching public duty status", error: error.message });
  }
});

// Get provider public info (email, phone, rating)
router.get("/public-info/:providerId", async (req, res) => {
  try {
    const { providerId } = req.params;
    const provider = await User.findById(providerId).select("name email phone companyName createdAt");
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Calculate average rating for the provider's services
    const services = await Service.find({ provider: providerId, isActive: true }).select('_id');
    const serviceIds = services.map(s => s._id);

    let averageRating = 0;
    if (serviceIds.length > 0) {
      const reviews = await Review.find({
        service: { $in: serviceIds },
        isActive: true,
        isApproved: true
      }).select('rating');

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        averageRating = totalRating / reviews.length;
      }
    }
    
    res.json({
      name: provider.name,
      companyName: provider.companyName,
      email: provider.email,
      phone: provider.phone,
      createdAt: provider.createdAt,
      averageRating: parseFloat(averageRating.toFixed(1))
    });
  } catch (error) {
    console.error("Error fetching public provider info:", error);
    res.status(500).json({ message: "Error fetching public provider info", error: error.message });
  }
});

// Get detailed provider information for premium individual seekers (with documents)
router.get("/details/:providerId", authMiddleware, async (req, res) => {
  try {
    const { providerId } = req.params;
    const userId = req.user.userId;
    
    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if user is individual seeker with premium subscription
    const isIndividualSeeker = currentUser.role === "seeker" && currentUser.seekerType === "individual";
    
    if (isIndividualSeeker) {
      // Check for premium membership
      let premiumMembership = await PremiumMembership.findOne({
        user: userId,
        paymentStatus: "paid",
        $or: [
          { status: "active" },
          { status: "pending" }
        ]
      }).sort({ createdAt: -1 });
      
      if (premiumMembership && premiumMembership.endDate && premiumMembership.endDate < new Date()) {
        premiumMembership = null;
      }

      // Check for subscription
      const Subscription = require("../models/Subscription");
      const subscription = await Subscription.findActiveForUser(userId);
      let hasActiveSubscription = false;
      
      if (subscription) {
        hasActiveSubscription = subscription.isActive() || subscription.isInTrial();
        if (!hasActiveSubscription && subscription.status === "active" && subscription.endDate > new Date()) {
          hasActiveSubscription = true;
        }
        
        // Check if subscription is for seekers
        if (hasActiveSubscription && subscription.plan) {
          if (subscription.plan.applicableTo !== "seeker" && subscription.plan.applicableTo !== "both") {
            hasActiveSubscription = false;
          }
        }
      }

      if (!premiumMembership && !hasActiveSubscription) {
        return res.status(403).json({
          success: false,
          message: "Premium subscription required to view provider details",
          code: "PREMIUM_REQUIRED"
        });
      }
    } else if (!["admin", "superadmin"].includes(currentUser.role)) {
      // Only individual seekers with premium, admins, and superadmins can access
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Get provider details
    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({ success: false, message: "User is not a provider" });
    }

    // Get provider services
    const services = await Service.find({ provider: providerId, isActive: true })
      .populate("category", "name")
      .populate("type", "name")
      .select("name price description photos category type createdAt");

    // Calculate average rating
    const serviceIds = services.map(s => s._id);
    let averageRating = 0;
    let totalReviews = 0;
    
    if (serviceIds.length > 0) {
      const reviews = await Review.find({
        service: { $in: serviceIds },
        isActive: true,
        isApproved: true
      }).select('rating');

      totalReviews = reviews.length;
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        averageRating = totalRating / reviews.length;
      }
    }

    // Build file URLs
    const buildFileUrl = (filename) => {
      if (!filename) return null;
      if (filename.startsWith('http://') || filename.startsWith('https://')) {
        return filename;
      }
      const baseUrl = process.env.FILE_BASE_URL || process.env.SERVER_URL || process.env.BASE_URL || 'http://localhost:5000';
      return `${baseUrl.replace(/\/$/, '')}/${filename}`;
    };

    // Get provider documents
    const documents = [];
    if (provider.idFile) documents.push({ name: "ID File", url: buildFileUrl(provider.idFile), type: "idFile" });
    if (provider.license) documents.push({ name: "License", url: buildFileUrl(provider.license), type: "license" });
    if (provider.tradeRegistration) documents.push({ name: "Trade Registration", url: buildFileUrl(provider.tradeRegistration), type: "tradeRegistration" });
    if (provider.professionalCertificate) documents.push({ name: "Professional Certificate", url: buildFileUrl(provider.professionalCertificate), type: "professionalCertificate" });
    if (provider.photo) documents.push({ name: "Photo", url: buildFileUrl(provider.photo), type: "photo" });
    if (provider.priceList) documents.push({ name: "Price List", url: buildFileUrl(provider.priceList), type: "priceList" });
    if (provider.video) documents.push({ name: "Video", url: buildFileUrl(provider.video), type: "video" });
    if (provider.servicePhotos && Array.isArray(provider.servicePhotos)) {
      provider.servicePhotos.forEach((photo, idx) => {
        documents.push({ name: `Service Photo ${idx + 1}`, url: buildFileUrl(photo), type: "servicePhoto" });
      });
    }

    res.json({
      success: true,
      provider: {
        _id: provider._id,
        name: provider.name,
        companyName: provider.companyName,
        email: provider.email,
        phone: provider.phone,
        alternativePhone: provider.alternativePhone,
        officePhone: provider.officePhone,
        whatsapp: provider.whatsapp,
        telegram: provider.telegram,
        address: provider.address,
        city: provider.city,
        location: provider.location,
        subRole: provider.subRole,
        serviceCategory: provider.serviceCategory,
        freelanceSubCategory: provider.freelanceSubCategory,
        gender: provider.gender,
        femaleLedOrOwned: provider.femaleLedOrOwned,
        tin: provider.tin,
        branches: provider.branches,
        banks: provider.banks,
        businessStatus: provider.businessStatus,
        createdAt: provider.createdAt,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews,
        totalServices: services.length,
        documents,
        services: services.map(s => ({
          _id: s._id,
          name: s.name,
          price: s.price,
          description: s.description,
          category: s.category?.name,
          type: s.type?.name,
          photos: s.photos || [],
          createdAt: s.createdAt
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching provider details:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching provider details",
      error: error.message 
    });
  }
});

module.exports = router;
