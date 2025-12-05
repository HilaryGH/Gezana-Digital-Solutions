const express = require("express");
const router = express.Router();
const SpecialOffer = require("../models/SpecialOffer");
const { authMiddleware } = require("../middleware/authMiddleware");
const PremiumMembership = require("../models/PremiumMembership");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const upload = require("../middleware/upload");
const { getFileUrl } = require("../utils/fileHelper");

// Middleware to check if provider has premium membership
const checkPremiumMembership = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Only providers can create special offers",
      });
    }

    // Check for premium membership (PremiumMembership model)
    // Accept memberships with paid status, even if status is pending (payment just completed)
    const premiumMembership = await PremiumMembership.findOne({
      user: userId,
      paymentStatus: "paid",
      $or: [
        { status: "active" },
        { status: "pending" } // Allow pending if payment is paid (payment just completed)
      ]
    }).sort({ createdAt: -1 }); // Get the most recent one
    
    // Additional check: if membership exists, verify endDate is valid or doesn't exist yet
    if (premiumMembership && premiumMembership.endDate && premiumMembership.endDate < new Date()) {
      // Membership expired, don't use it
      premiumMembership = null;
    }

    // Check for subscription using the model's method
    const subscription = await Subscription.findActiveForUser(userId);
    let hasActiveSubscription = false;
    
    if (subscription) {
      hasActiveSubscription = subscription.isActive() || subscription.isInTrial();
      // Also check if subscription is valid even if paymentStatus is not "paid" but status is active
      if (!hasActiveSubscription && subscription.status === "active" && subscription.endDate > new Date()) {
        hasActiveSubscription = true;
      }
    }

    // Also check subscription with payment status (fallback)
    let hasSubscription = false;
    if (!hasActiveSubscription) {
      const subscriptionCheck = await Subscription.findOne({
        user: userId,
        $or: [
          { status: "active", endDate: { $gte: new Date() } },
          { status: "trial", endDate: { $gte: new Date() } }
        ]
      }).populate("plan");
      
      if (subscriptionCheck && subscriptionCheck.plan) {
        // Check if plan is for providers
        if (subscriptionCheck.plan.applicableTo === "provider" || 
            subscriptionCheck.plan.applicableTo === "both") {
          hasSubscription = true;
        }
      }
    }

    console.log("Premium check for user:", userId, {
      premiumMembership: !!premiumMembership,
      hasActiveSubscription,
      hasSubscription,
      subscriptionStatus: subscription?.status,
      subscriptionPaymentStatus: subscription?.paymentStatus,
      subscriptionEndDate: subscription?.endDate
    });

    if (!premiumMembership && !hasActiveSubscription && !hasSubscription) {
      return res.status(403).json({
        success: false,
        message: "Premium membership required to create special offers",
        code: "PREMIUM_REQUIRED",
      });
    }

    req.hasPremium = true;
    next();
  } catch (error) {
    console.error("Error checking premium membership:", error);
    res.status(500).json({
      success: false,
      message: "Error checking premium membership status",
    });
  }
};

// Create a new special offer (All providers)
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    // Check if user is a provider
    const user = await User.findById(req.user.userId);
    if (user.role !== "provider") {
      return res.status(403).json({
        success: false,
        message: "Only providers can create special offers",
      });
    }

    console.log("=== Creating Special Offer ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: getFileUrl(req.file)
    } : "NO FILE");
    console.log("Content-Type header:", req.headers['content-type']);

    // Check if image file was uploaded (required)
    if (!req.file) {
      console.error("ERROR: No file received in request");
      return res.status(400).json({
        success: false,
        message: "Offer image is required. Please upload an image file (JPG, PNG, GIF, or WEBP).",
      });
    }

    // Parse FormData values (they come as strings)
    const service = req.body.service;
    const title = req.body.title;
    const description = req.body.description;
    const discountType = req.body.discountType;
    const discountValue = parseFloat(req.body.discountValue);
    const originalPrice = parseFloat(req.body.originalPrice);
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const maxUses = req.body.maxUses ? parseInt(req.body.maxUses) : null;
    const terms = req.body.terms || null;

    // Validate required fields
    if (!service || !title || !description || !discountType || isNaN(discountValue) || isNaN(originalPrice) || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Calculate discounted price
    let discountedPrice = originalPrice;
    if (discountType === "percentage") {
      discountedPrice = originalPrice * (1 - discountValue / 100);
    } else if (discountType === "fixed") {
      discountedPrice = originalPrice - discountValue;
    }

    if (discountedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Discounted price cannot be negative",
      });
    }

    // Get file URL (Cloudinary or local)
    const imageUrl = getFileUrl(req.file);

    const offer = new SpecialOffer({
      provider: req.user.userId,
      service,
      title,
      description,
      discountType,
      discountValue,
      originalPrice,
      discountedPrice: Math.round(discountedPrice * 100) / 100, // Round to 2 decimal places
      startDate: start,
      endDate: end,
      maxUses: maxUses,
      image: imageUrl,
      terms: terms,
      isActive: true,
      currentUses: 0,
    });

    await offer.save();
    await offer.populate("service", "name price");
    await offer.populate("provider", "name companyName");

    res.status(201).json({
      success: true,
      message: "Special offer created successfully",
      offer,
    });
  } catch (error) {
    console.error("Error creating special offer:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error creating special offer",
      error: error.message,
    });
  }
});

// Get all special offers for a provider
router.get("/my-offers", authMiddleware, async (req, res) => {
  try {
    const offers = await SpecialOffer.find({ provider: req.user.userId })
      .populate("service", "name price photos")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      offers,
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching special offers",
    });
  }
});

// Get active special offers for a service
router.get("/service/:serviceId", async (req, res) => {
  try {
    const now = new Date();
    const offers = await SpecialOffer.find({
      service: req.params.serviceId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("provider", "name companyName")
      .populate("service", "name price")
      .sort({ createdAt: -1 });

    // Filter offers that haven't reached max uses
    const validOffers = offers.filter((offer) => {
      if (offer.maxUses === null) return true;
      return offer.currentUses < offer.maxUses;
    });

    res.json({
      success: true,
      offers: validOffers,
    });
  } catch (error) {
    console.error("Error fetching service offers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching special offers",
    });
  }
});

// Get all active special offers (public)
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    
    // First, get all offers (including inactive ones for debugging)
    const allOffers = await SpecialOffer.find({})
      .populate("provider", "name companyName")
      .populate("service", "name price photos category")
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log(`📊 Total offers in database: ${allOffers.length}`);
    console.log(`📅 Current date/time: ${now.toISOString()}`);
    
    // Log all offers for debugging
    allOffers.forEach((offer, index) => {
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);
      const startDateValid = startDate <= now;
      const endDateValid = endDate >= now;
      
      console.log(`\nOffer ${index + 1}:`, {
        id: offer._id,
        title: offer.title,
        isActive: offer.isActive,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startDateValid,
        endDateValid,
        hasService: !!offer.service,
        serviceId: offer.service?._id || offer.service?.id,
        hasProvider: !!offer.provider,
        maxUses: offer.maxUses,
        currentUses: offer.currentUses
      });
    });
    
    // Filter active offers with valid dates - be more lenient
    const offers = allOffers.filter((offer) => {
      // Check if offer is active (default to true if not set)
      const isActive = offer.isActive !== false; // More lenient: only filter if explicitly false
      
      // Check dates
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);
      const startDateValid = startDate <= now;
      const endDateValid = endDate >= now;
      const dateValid = startDateValid && endDateValid;
      
      // Check if service exists (don't filter if service is missing, just log)
      const hasService = !!offer.service;
      
      if (!isActive) {
        console.log(`❌ Offer ${offer._id} (${offer.title}) filtered: isActive = ${offer.isActive}`);
        return false;
      }
      if (!dateValid) {
        console.log(`❌ Offer ${offer._id} (${offer.title}) filtered: dates invalid`);
        console.log(`   Start: ${startDate.toISOString()} (valid: ${startDateValid})`);
        console.log(`   End: ${endDate.toISOString()} (valid: ${endDateValid})`);
        console.log(`   Now: ${now.toISOString()}`);
        return false;
      }
      if (!hasService) {
        console.log(`⚠️  Offer ${offer._id} (${offer.title}) has no service, but including it anyway`);
      }
      return true;
    });
    
    console.log(`✅ Offers after date/active filter: ${offers.length}`);

    // Filter offers that haven't reached max uses
    const validOffers = offers.filter((offer) => {
      if (offer.maxUses === null || offer.maxUses === undefined) return true;
      const canUse = offer.currentUses < offer.maxUses;
      if (!canUse) {
        console.log(`❌ Offer ${offer._id} (${offer.title}) filtered: max uses reached (${offer.currentUses}/${offer.maxUses})`);
      }
      return canUse;
    });
    
    console.log(`✅ Final valid offers: ${validOffers.length}`);
    
    // If no valid offers but we have offers in DB, return them anyway for debugging
    if (validOffers.length === 0 && allOffers.length > 0) {
      console.log(`⚠️  No valid offers found, but ${allOffers.length} offers exist in database`);
      console.log(`⚠️  Returning all offers for debugging purposes`);
      
      res.json({
        success: true,
        offers: allOffers.map(offer => ({
          ...offer.toObject(),
          _debug: {
            isActive: offer.isActive,
            startDate: offer.startDate,
            endDate: offer.endDate,
            dateValid: new Date(offer.startDate) <= now && new Date(offer.endDate) >= now,
            hasService: !!offer.service,
            hasProvider: !!offer.provider
          }
        })),
        debug: {
          totalOffers: allOffers.length,
          afterDateFilter: offers.length,
          finalCount: validOffers.length,
          currentTime: now.toISOString(),
          warning: "No valid offers found, returning all offers for debugging"
        }
      });
      return;
    }

    res.json({
      success: true,
      offers: validOffers,
      debug: {
        totalOffers: allOffers.length,
        afterDateFilter: offers.length,
        finalCount: validOffers.length,
        currentTime: now.toISOString()
      }
    });
  } catch (error) {
    console.error("Error fetching active offers:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching special offers",
      error: error.message
    });
  }
});

// Get single offer by ID
router.get("/:id", async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id)
      .populate("provider", "name companyName email")
      .populate("service", "name price photos description");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found",
      });
    }

    res.json({
      success: true,
      offer,
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching special offer",
    });
  }
});

// Update special offer
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("=== Updating Special Offer ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: getFileUrl(req.file)
    } : "NO FILE (keeping existing)");

    const offer = await SpecialOffer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found",
      });
    }

    // Check if user owns this offer
    if (offer.provider.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only update your own offers",
      });
    }

    // Parse FormData values (they come as strings)
    const title = req.body.title;
    const description = req.body.description;
    const discountType = req.body.discountType;
    const discountValue = req.body.discountValue !== undefined ? parseFloat(req.body.discountValue) : undefined;
    const originalPrice = req.body.originalPrice !== undefined ? parseFloat(req.body.originalPrice) : undefined;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const maxUses = req.body.maxUses !== undefined ? (req.body.maxUses ? parseInt(req.body.maxUses) : null) : undefined;
    const terms = req.body.terms;
    const isActive = req.body.isActive !== undefined ? (req.body.isActive === 'true' || req.body.isActive === true) : undefined;

    // Handle image upload - if new file uploaded, use it; otherwise keep existing
    let imageUrl = offer.image; // Keep existing image by default
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imageUrl = getFileUrl(req.file);
    }

    if (title) offer.title = title;
    if (description) offer.description = description;
    if (discountType) offer.discountType = discountType;
    if (discountValue !== undefined && !isNaN(discountValue)) offer.discountValue = discountValue;
    if (originalPrice !== undefined && !isNaN(originalPrice)) offer.originalPrice = originalPrice;
    if (startDate) offer.startDate = new Date(startDate);
    if (endDate) offer.endDate = new Date(endDate);
    if (maxUses !== undefined) offer.maxUses = maxUses;
    offer.image = imageUrl; // Always update image (either new or existing)
    if (terms !== undefined) offer.terms = terms;
    if (isActive !== undefined) offer.isActive = isActive;

    // Recalculate discounted price if price or discount changed
    if (discountType || discountValue !== undefined || originalPrice !== undefined) {
      const finalDiscountType = discountType || offer.discountType;
      const finalDiscountValue = discountValue !== undefined ? discountValue : offer.discountValue;
      const finalOriginalPrice = originalPrice !== undefined ? originalPrice : offer.originalPrice;

      let discountedPrice = finalOriginalPrice;
      if (finalDiscountType === "percentage") {
        discountedPrice = finalOriginalPrice * (1 - finalDiscountValue / 100);
      } else if (finalDiscountType === "fixed") {
        discountedPrice = finalOriginalPrice - finalDiscountValue;
      }
      offer.discountedPrice = Math.round(discountedPrice * 100) / 100;
    }

    await offer.save();
    await offer.populate("service", "name price");
    await offer.populate("provider", "name companyName");

    res.json({
      success: true,
      message: "Special offer updated successfully",
      offer,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error updating special offer",
      error: error.message,
    });
  }
});

// Delete special offer
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found",
      });
    }

    // Check if user owns this offer
    if (offer.provider.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only delete your own offers",
      });
    }

    await offer.deleteOne();

    res.json({
      success: true,
      message: "Special offer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting special offer",
    });
  }
});

// Toggle offer active status
router.patch("/:id/toggle", authMiddleware, async (req, res) => {
  try {
    const offer = await SpecialOffer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Special offer not found",
      });
    }

    // Check if user owns this offer
    if (offer.provider.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only toggle your own offers",
      });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    res.json({
      success: true,
      message: `Offer ${offer.isActive ? "activated" : "deactivated"} successfully`,
      offer,
    });
  } catch (error) {
    console.error("Error toggling offer:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling offer status",
    });
  }
});

// Check if provider has premium membership (for frontend)
router.get("/check-premium/status", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (user.role !== "provider") {
      return res.json({
        success: true,
        hasPremium: false,
        message: "Only providers can have premium membership",
      });
    }

    // Check for premium membership
    // Accept memberships with paid status, even if status is pending (payment just completed)
    let premiumMembership = await PremiumMembership.findOne({
      user: userId,
      paymentStatus: "paid",
      $or: [
        { status: "active" },
        { status: "pending" } // Allow pending if payment is paid
      ]
    }).sort({ createdAt: -1 }); // Get the most recent one
    
    // Additional check: if membership exists, verify endDate is valid or doesn't exist yet
    if (premiumMembership && premiumMembership.endDate && premiumMembership.endDate < new Date()) {
      // Membership expired, don't use it
      premiumMembership = null;
    }

    // Check for subscription using the model's method
    const subscription = await Subscription.findActiveForUser(userId);
    let hasActiveSubscription = false;
    let subscriptionInfo = null;

    if (subscription) {
      hasActiveSubscription = subscription.isActive() || subscription.isInTrial();
      // Also check if subscription is valid even if paymentStatus is not "paid" but status is active
      if (!hasActiveSubscription && subscription.status === "active" && subscription.endDate > new Date()) {
        hasActiveSubscription = true;
      }
      
      if (hasActiveSubscription && subscription.plan) {
        // Check if plan is for providers
        if (subscription.plan.applicableTo === "provider" || subscription.plan.applicableTo === "both") {
          subscriptionInfo = {
            planName: subscription.plan.displayName || subscription.plan.name,
            endDate: subscription.endDate,
            status: subscription.status,
            paymentStatus: subscription.paymentStatus,
          };
        }
      }
    }

    // Fallback: Check subscription with more flexible criteria
    if (!hasActiveSubscription) {
      const subscriptionCheck = await Subscription.findOne({
        user: userId,
        $or: [
          { status: "active", endDate: { $gte: new Date() } },
          { status: "trial", endDate: { $gte: new Date() } }
        ]
      }).populate("plan");

      if (subscriptionCheck && subscriptionCheck.plan) {
        if (subscriptionCheck.plan.applicableTo === "provider" || subscriptionCheck.plan.applicableTo === "both") {
          hasActiveSubscription = true;
          subscriptionInfo = {
            planName: subscriptionCheck.plan.displayName || subscriptionCheck.plan.name,
            endDate: subscriptionCheck.endDate,
            status: subscriptionCheck.status,
            paymentStatus: subscriptionCheck.paymentStatus,
          };
        }
      }
    }

    const hasPremium = !!(premiumMembership || hasActiveSubscription);

    res.json({
      success: true,
      hasPremium,
      premiumMembership: premiumMembership ? {
        planName: premiumMembership.planName,
        endDate: premiumMembership.endDate,
        status: premiumMembership.status,
        paymentStatus: premiumMembership.paymentStatus,
      } : null,
      subscription: subscriptionInfo,
    });
  } catch (error) {
    console.error("Error checking premium status:", error);
    res.status(500).json({
      success: false,
      message: "Error checking premium status",
    });
  }
});

module.exports = router;
