// server/routes/user.js
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcryptjs"); // or "bcrypt" depending on what you installed


const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/me", authMiddleware, async (req, res) => {
  const { name, email, phone, password } = req.body; // include phone
  try {
    const updates = { name, email, phone }; // include phone here too
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

// Add this at the top if not already
const isAdmin = require("../middleware/isAdmin"); // you need to create this if missing

// GET all users (admin, support, marketing only)
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all users (for support and marketing analytics)
router.get("/all", authMiddleware, async (req, res) => {
  // Allow admin, support, marketing, and superadmin
  if (!["admin", "superadmin", "support", "marketing"].includes(req.user.role)) {
    return res.status(403).json({ message: "Permission denied" });
  }
  
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const buildFileBaseUrl = (req) => {
  const envBase = process.env.FILE_BASE_URL;
  if (envBase) {
    return envBase.replace(/\/$/, "");
  }
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  return `${protocol}://${req.get("host")}`;
};

const toPublicFileUrl = (req, storedPath) => {
  if (!storedPath) return null;
  if (/^https?:\/\//i.test(storedPath)) {
    return storedPath;
  }
  const sanitized = storedPath.replace(/^\/+/, "").replace(/^uploads\//i, "");
  return `${buildFileBaseUrl(req)}/${sanitized}`;
};

const formatProviderResponse = (providerDoc, req) => {
  const provider = providerDoc.toObject ? providerDoc.toObject() : providerDoc;

  return {
    _id: provider._id,
    name: provider.name,
    email: provider.email,
    phone: provider.phone,
    role: provider.role,
    city: provider.city,
    location: provider.location,
    serviceType: provider.serviceType,
    subRole: provider.subRole,
    createdAt: provider.createdAt,
    isVerified: provider.isVerified,
    verificationStatus: provider.verificationStatus,
    verificationNotes: provider.verificationNotes,
    verifiedAt: provider.verifiedAt,
    credentials: (provider.credentials || [])
      .map((file) => toPublicFileUrl(req, file))
      .filter(Boolean),
    documents: {
      license: toPublicFileUrl(req, provider.license),
      tradeRegistration: toPublicFileUrl(req, provider.tradeRegistration),
      professionalCertificate: toPublicFileUrl(req, provider.professionalCertificate),
      priceList: toPublicFileUrl(req, provider.priceList),
      photo: toPublicFileUrl(req, provider.photo),
      video: toPublicFileUrl(req, provider.video),
      servicePhotos: Array.isArray(provider.servicePhotos)
        ? provider.servicePhotos.map((photo) => toPublicFileUrl(req, photo)).filter(Boolean)
        : [],
    },
  };
};

// GET all providers (admin only)
router.get("/admin/providers", authMiddleware, async (req, res) => {
  if (!["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const providers = await User.find({ role: "provider" })
      .select("-password")
      .sort({ createdAt: -1 });

    const formattedProviders = providers.map((provider) =>
      formatProviderResponse(provider, req)
    );

    res.json(formattedProviders);
  } catch (err) {
    console.error("Error fetching providers:", err);
    res.status(500).json({ message: "Failed to fetch providers" });
  }
});

router.patch("/admin/providers/:providerId/verify", authMiddleware, async (req, res) => {
  if (!["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access required" });
  }

  const { status, notes } = req.body;
  const allowedStatuses = ["approved", "rejected", "pending"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid verification status" });
  }

  try {
    const updatePayload = {
      verificationStatus: status,
      verificationNotes: notes,
      isVerified: status === "approved",
      verifiedBy: req.user.userId,
      verifiedAt: status === "approved" ? new Date() : null,
    };

    const provider = await User.findOneAndUpdate(
      { _id: req.params.providerId, role: "provider" },
      updatePayload,
      { new: true }
    ).select("-password");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({
      message:
        status === "approved"
          ? "Provider verified"
          : status === "rejected"
            ? "Provider rejected"
            : "Provider set to pending",
      provider: formatProviderResponse(provider, req),
    });
  } catch (err) {
    console.error("Error updating provider verification:", err);
    res.status(500).json({ message: "Failed to update provider verification" });
  }
});
router.get("/loyalty", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("loyaltyPoints");
    res.json({ points: user.loyaltyPoints });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch loyalty points" });
  }
});
router.post("/redeem", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (user.loyaltyPoints < 100) {
      return res.status(400).json({ message: "Not enough points to redeem." });
    }

    user.loyaltyPoints -= 100;
    await user.save();

    res.json({
      message: "Redeemed successfully. You now have a 10% discount on your next booking.",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to redeem points" });
  }
});




module.exports = router;
