const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const Referral = require("../models/Referral");
const User = require("../models/User");

// Get current user's referrals (for individual dashboard)
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's referral code and stats
    const user = await User.findById(userId).select("referralCode referralCount referralEarnings");
    
    // Get referrals where this user is the referrer
    const referrals = await Referral.find({ referrer: userId })
      .populate("referredUser", "name email createdAt")
      .populate("bookingId", "date status service")
      .sort("-createdAt")
      .lean();

    // Calculate stats
    const stats = {
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter(r => r.status === "completed").length,
      pendingReferrals: referrals.filter(r => r.status === "pending").length,
      totalEarnings: user.referralEarnings || 0,
      referralCount: user.referralCount || 0
    };

    res.json({
      success: true,
      referralCode: user.referralCode || null,
      stats,
      referrals: referrals.map(ref => ({
        _id: ref._id,
        referredUser: ref.referredUser ? {
          name: ref.referredUser.name,
          email: ref.referredUser.email,
          joinedAt: ref.referredUser.createdAt
        } : null,
        referralCode: ref.referralCode,
        status: ref.status,
        usedInRegistration: ref.usedInRegistration,
        usedInPurchase: ref.usedInPurchase,
        bookingId: ref.bookingId ? ref.bookingId._id : null,
        rewardAmount: ref.rewardAmount || 0,
        createdAt: ref.createdAt,
        updatedAt: ref.updatedAt
      }))
    });
  } catch (error) {
    console.error("Error fetching user referrals:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching referrals", 
      error: error.message 
    });
  }
});

// Get all referrals (admin only)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: "Admin access required" 
      });
    }

    const { page = 1, limit = 50, status, referrerId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (status) query.status = status;
    if (referrerId) query.referrer = referrerId;

    // Get referrals with pagination
    const referrals = await Referral.find(query)
      .populate("referrer", "name email referralCode")
      .populate("referredUser", "name email createdAt")
      .populate("bookingId", "date status service")
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Referral.countDocuments(query);

    // Calculate overall stats
    const allReferrals = await Referral.find().lean();
    const stats = {
      total: allReferrals.length,
      completed: allReferrals.filter(r => r.status === "completed").length,
      pending: allReferrals.filter(r => r.status === "pending").length,
      cancelled: allReferrals.filter(r => r.status === "cancelled").length,
      totalEarnings: allReferrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0),
      registrationReferrals: allReferrals.filter(r => r.usedInRegistration).length,
      purchaseReferrals: allReferrals.filter(r => r.usedInPurchase).length,
      totalReferrers: 0 // Will be set in stats endpoint
    };

    res.json({
      success: true,
      referrals: referrals.map(ref => ({
        _id: ref._id,
        referrer: ref.referrer ? {
          _id: ref.referrer._id,
          name: ref.referrer.name,
          email: ref.referrer.email,
          referralCode: ref.referrer.referralCode
        } : null,
        referredUser: ref.referredUser ? {
          _id: ref.referredUser._id,
          name: ref.referredUser.name,
          email: ref.referredUser.email,
          joinedAt: ref.referredUser.createdAt
        } : null,
        referralCode: ref.referralCode,
        status: ref.status,
        usedInRegistration: ref.usedInRegistration,
        usedInPurchase: ref.usedInPurchase,
        bookingId: ref.bookingId ? ref.bookingId._id : null,
        rewardAmount: ref.rewardAmount || 0,
        createdAt: ref.createdAt,
        updatedAt: ref.updatedAt
      })),
      stats: {
        ...stats,
        totalReferrers: await User.countDocuments({ referralCode: { $exists: true, $ne: null } })
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching all referrals:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching referrals", 
      error: error.message 
    });
  }
});

// Get referral statistics summary (admin)
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: "Admin access required" 
      });
    }

    const allReferrals = await Referral.find().lean();
    const allUsers = await User.find({ referralCode: { $exists: true, $ne: null } })
      .select("name referralCode referralCount referralEarnings")
      .lean();

    const stats = {
      totalReferrals: allReferrals.length,
      totalReferrers: allUsers.length,
      completedReferrals: allReferrals.filter(r => r.status === "completed").length,
      pendingReferrals: allReferrals.filter(r => r.status === "pending").length,
      totalEarnings: allReferrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0),
      registrationReferrals: allReferrals.filter(r => r.usedInRegistration).length,
      purchaseReferrals: allReferrals.filter(r => r.usedInPurchase).length,
      topReferrers: allUsers
        .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0))
        .slice(0, 10)
        .map(user => ({
          name: user.name,
          referralCode: user.referralCode,
          referralCount: user.referralCount || 0,
          earnings: user.referralEarnings || 0
        }))
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching referral stats", 
      error: error.message 
    });
  }
});

module.exports = router;

