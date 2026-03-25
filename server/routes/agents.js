const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Referral = require("../models/Referral");
const AgentProfessional = require("../models/AgentProfessional");
const upload = require("../middleware/upload");
const { getFileUrl } = require("../utils/fileHelper");

const router = express.Router();

const ID_DOCUMENT_TYPES = ["fayda", "kebele_id", "driving_licence", "passport"];

const professionalUpload = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "idAttachment", maxCount: 1 },
]);

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

// GET /api/agents/superadmin/agent-professionals
// All professionals submitted by agents (superadmin only)
router.get("/superadmin/agent-professionals", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Superadmin access required" });
    }

    const professionals = await AgentProfessional.find({})
      .populate("agent", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ professionals });
  } catch (err) {
    console.error("Error fetching agent-submitted professionals:", err);
    res.status(500).json({ message: "Failed to fetch agent professionals" });
  }
});

// POST /api/agents/my-professionals
// Agent adds a professional lead/listing (optional multipart fields `photo`, `idAttachment`)
router.post(
  "/my-professionals",
  authMiddleware,
  professionalUpload,
  async (req, res) => {
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
        idDocumentType,
      } = req.body;

      if (!fullName || !phone) {
        return res.status(400).json({ message: "fullName and phone are required" });
      }

      const photoFile = req.files?.photo?.[0];
      const idFile = req.files?.idAttachment?.[0];
      const photo = photoFile ? getFileUrl(photoFile) : undefined;

      if (idFile) {
        if (!idDocumentType || !ID_DOCUMENT_TYPES.includes(idDocumentType)) {
          return res.status(400).json({
            message:
              "When uploading an ID attachment, select document type: Fayda, Kebele ID, Driving licence, or Passport.",
          });
        }
      }

      const idAttachment = idFile ? getFileUrl(idFile) : undefined;

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
        ...(photo ? { photo } : {}),
        ...(idAttachment ? { idAttachment, idDocumentType } : {}),
        status: "pending",
      });

      res.status(201).json({ message: "Professional added", professional: doc });
    } catch (err) {
      console.error("Error adding agent professional:", err);
      res.status(500).json({ message: "Failed to add professional" });
    }
  }
);

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

// PUT /api/agents/my-professionals/:id
// Agent updates one of their submitted professionals (optional multipart fields `photo`, `idAttachment`)
router.put(
  "/my-professionals/:id",
  authMiddleware,
  professionalUpload,
  async (req, res) => {
    try {
      const me = await User.findById(req.user.userId).select("role");
      if (!me) return res.status(404).json({ message: "User not found" });
      if (me.role !== "agent") return res.status(403).json({ message: "Agent access required" });

      const doc = await AgentProfessional.findOne({ _id: req.params.id, agent: me._id });
      if (!doc) return res.status(404).json({ message: "Professional not found" });

      const fields = [
        "fullName",
        "phone",
        "email",
        "whatsapp",
        "telegram",
        "city",
        "location",
        "serviceType",
        "notes",
      ];
      for (const field of fields) {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          doc[field] = req.body[field];
        }
      }

      const photoFile = req.files?.photo?.[0];
      const idFile = req.files?.idAttachment?.[0];
      if (photoFile) {
        doc.photo = getFileUrl(photoFile);
      }

      if (idFile) {
        if (!req.body.idDocumentType || !ID_DOCUMENT_TYPES.includes(req.body.idDocumentType)) {
          return res.status(400).json({
            message:
              "When uploading an ID attachment, select document type: Fayda, Kebele ID, Driving licence, or Passport.",
          });
        }
        doc.idAttachment = getFileUrl(idFile);
        doc.idDocumentType = req.body.idDocumentType;
      } else if (
        Object.prototype.hasOwnProperty.call(req.body, "idDocumentType") &&
        req.body.idDocumentType &&
        ID_DOCUMENT_TYPES.includes(req.body.idDocumentType) &&
        doc.idAttachment
      ) {
        doc.idDocumentType = req.body.idDocumentType;
      }

      await doc.save();
      res.json({ message: "Professional updated", professional: doc });
    } catch (err) {
      console.error("Error updating agent professional:", err);
      res.status(500).json({ message: "Failed to update professional" });
    }
  }
);

// PATCH /api/agents/my-professionals/:id/verify
// Agent marks one of their submitted professionals as approved
router.patch("/my-professionals/:id/verify", authMiddleware, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId).select("role");
    if (!me) return res.status(404).json({ message: "User not found" });
    if (me.role !== "agent") return res.status(403).json({ message: "Agent access required" });

    const doc = await AgentProfessional.findOne({ _id: req.params.id, agent: me._id });
    if (!doc) return res.status(404).json({ message: "Professional not found" });

    doc.status = "approved";
    await doc.save();

    res.json({ message: "Professional verified", professional: doc });
  } catch (err) {
    console.error("Error verifying agent professional:", err);
    res.status(500).json({ message: "Failed to verify professional" });
  }
});

// DELETE /api/agents/my-professionals/:id
// Agent permanently deletes one of their submitted professionals
router.delete("/my-professionals/:id", authMiddleware, async (req, res) => {
  try {
    const me = await User.findById(req.user.userId).select("role");
    if (!me) return res.status(404).json({ message: "User not found" });
    if (me.role !== "agent") return res.status(403).json({ message: "Agent access required" });

    const existing = await AgentProfessional.findOne({ _id: req.params.id, agent: me._id });
    if (!existing) return res.status(404).json({ message: "Professional not found" });

    await AgentProfessional.deleteOne({ _id: existing._id });

    res.json({ message: "Professional deleted permanently" });
  } catch (err) {
    console.error("Error deleting agent professional:", err);
    res.status(500).json({ message: "Failed to delete professional" });
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

