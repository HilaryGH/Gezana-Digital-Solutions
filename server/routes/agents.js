const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Referral = require("../models/Referral");
const AgentProfessional = require("../models/AgentProfessional");

const router = express.Router();

// GET /api/agents/dashboard
// Summary stats for agent dashboard (referrals, commission, performance)
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId).select(
      "role name email referralCode referralCount referralEarnings"
    );
    if (!me) return res.status(404).json({ message: "User not found" });
    if (me.role !== "agent") return res.status(403).json({ message: "Agent access required" });

    const referrals = await Referral.find({ referrer: me._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("referredUser", "name email createdAt")
      .populate("bookingId", "createdAt")
      .lean();

    const all = await Referral.find({ referrer: me._id }).lean();
    const registrationReferrals = all.filter((r) => r.usedInRegistration).length;
    const purchaseReferrals = all.filter((r) => r.usedInPurchase).length;
    const totalReferrals = all.length;
    const totalEarnings = me.referralEarnings || 0;

    const conversionRate =
      registrationReferrals > 0 ? purchaseReferrals / registrationReferrals : 0;

    res.json({
      me: {
        id: me._id,
        name: me.name,
        email: me.email,
        referralCode: me.referralCode || null,
      },
      stats: {
        totalReferrals,
        registrationReferrals,
        purchaseReferrals,
        totalEarnings,
        conversionRate,
      },
      recentReferrals: referrals.map((r) => ({
        _id: r._id,
        referralCode: r.referralCode,
        usedInRegistration: !!r.usedInRegistration,
        usedInPurchase: !!r.usedInPurchase,
        rewardAmount: r.rewardAmount || 0,
        createdAt: r.createdAt,
        referredUser: r.referredUser
          ? {
              name: r.referredUser.name,
              email: r.referredUser.email,
              joinedAt: r.referredUser.createdAt,
            }
          : null,
      })),
    });
  } catch (err) {
    console.error("Error fetching agent dashboard:", err);
    res.status(500).json({ message: "Failed to fetch agent dashboard" });
  }
});

// POST /api/agents/my-professionals
// Agent adds a professional lead/listing
router.post("/my-professionals", authMiddleware, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId).select("role");
    if (!me) return res.status(404).json({ message: "User not found" });
    if (me.role !== "agent") return res.status(403).json({ message: "Agent access required" });

    const {
      fullName,
      phone,
      email,
      whatsapp,
      telegram,
      city,
      location,
      serviceType,
      notes,
    } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ message: "fullName and phone are required" });
    }

    const doc = await AgentProfessional.create({
      agent: me._id,
      fullName,
      phone,
      email,
      whatsapp,
      telegram,
      city,
      location,
      serviceType,
      notes,
      status: "pending",
    });

    res.status(201).json({ message: "Professional added", professional: doc });
  } catch (err) {
    console.error("Error adding agent professional:", err);
    res.status(500).json({ message: "Failed to add professional" });
  }
});

// GET /api/agents/my-professionals
// Agent lists their submitted professionals
router.get("/my-professionals", authMiddleware, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId).select("role");
    if (!me) return res.status(404).json({ message: "User not found" });
    if (me.role !== "agent") return res.status(403).json({ message: "Agent access required" });

    const professionals = await AgentProfessional.find({ agent: me._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ professionals });
  } catch (err) {
    console.error("Error listing agent professionals:", err);
    res.status(500).json({ message: "Failed to fetch professionals" });
  }
});

// GET /api/agents/professionals
// Returns verified providers for agents
router.get("/professionals", authMiddleware, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId).select("role");
    if (!me) return res.status(404).json({ message: "User not found" });

    if (me.role !== "agent") {
      return res.status(403).json({ message: "Agent access required" });
    }

    const providers = await User.find({
      role: "provider",
      isActive: true,
      isVerified: true,
    })
      .select("name serviceType city location phone whatsapp telegram email photo")
      .sort({ createdAt: -1 });

    res.json({ professionals: providers });
  } catch (err) {
    console.error("Error fetching professionals for agent:", err);
    res.status(500).json({ message: "Failed to fetch professionals" });
  }
});

module.exports = router;

