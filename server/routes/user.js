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

// GET all users (admin only)
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all providers (admin only)
router.get("/admin/providers", authMiddleware, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const providers = await User.find({ role: "provider" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(providers);
  } catch (err) {
    console.error("Error fetching providers:", err);
    res.status(500).json({ message: "Failed to fetch providers" });
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
