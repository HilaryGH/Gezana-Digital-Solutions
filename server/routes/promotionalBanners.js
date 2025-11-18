const express = require("express");
const router = express.Router();
const PromotionalBanner = require("../models/PromotionalBanner");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /api/promotional-banners - Get all active promotional banners (public)
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const banners = await PromotionalBanner.find({
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    })
      .sort({ order: 1, createdAt: -1 })
      .select("-createdBy -__v");

    res.json(banners);
  } catch (err) {
    console.error("Error fetching promotional banners:", err);
    res.status(500).json({ message: "Could not fetch promotional banners", error: err.message });
  }
});

// GET /api/promotional-banners/all - Get all banners (admin only)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin or superadmin
    if (!["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const banners = await PromotionalBanner.find()
      .sort({ order: 1, createdAt: -1 })
      .populate("createdBy", "name email");

    res.json(banners);
  } catch (err) {
    console.error("Error fetching all promotional banners:", err);
    res.status(500).json({ message: "Could not fetch promotional banners", error: err.message });
  }
});

// GET /api/promotional-banners/mine - Get banners created by current user (provider/admin)
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin, superadmin, or provider
    if (!["admin", "superadmin", "provider"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const banners = await PromotionalBanner.find({ createdBy: req.user.userId })
      .sort({ order: 1, createdAt: -1 })
      .populate("createdBy", "name email");

    res.json(banners);
  } catch (err) {
    console.error("Error fetching user promotional banners:", err);
    res.status(500).json({ message: "Could not fetch promotional banners", error: err.message });
  }
});

// GET /api/promotional-banners/:id - Get single banner
router.get("/:id", async (req, res) => {
  try {
    const banner = await PromotionalBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Promotional banner not found" });
    }
    res.json(banner);
  } catch (err) {
    console.error("Error fetching promotional banner:", err);
    res.status(500).json({ message: "Could not fetch promotional banner", error: err.message });
  }
});

// POST /api/promotional-banners - Create new banner (admin or provider)
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin, superadmin, or provider
    if (!["admin", "superadmin", "provider"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Admin or Provider access required" });
    }

    const {
      title,
      subtitle,
      description,
      icon,
      backgroundColor,
      textColor,
      buttonText,
      buttonLink,
      image,
      isActive,
      order,
      startDate,
      endDate,
    } = req.body;

    const banner = new PromotionalBanner({
      title,
      subtitle,
      description,
      icon: icon || "✨",
      backgroundColor: backgroundColor || "from-blue-500 via-blue-600 to-blue-700",
      textColor: textColor || "text-white",
      buttonText: buttonText || "Learn More",
      buttonLink: buttonLink || "/services",
      image,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: req.user.userId,
    });

    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    console.error("Error creating promotional banner:", err);
    res.status(500).json({ message: "Could not create promotional banner", error: err.message });
  }
});

// PUT /api/promotional-banners/:id - Update banner (admin or provider - can only update their own)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin, superadmin, or provider
    if (!["admin", "superadmin", "provider"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const banner = await PromotionalBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Promotional banner not found" });
    }

    // Providers can only update their own banners, admins can update any
    if (req.user.role === "provider" && banner.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only update your own promotional banners" });
    }

    const {
      title,
      subtitle,
      description,
      icon,
      backgroundColor,
      textColor,
      buttonText,
      buttonLink,
      image,
      isActive,
      order,
      startDate,
      endDate,
    } = req.body;

    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (description !== undefined) banner.description = description;
    if (icon !== undefined) banner.icon = icon;
    if (backgroundColor !== undefined) banner.backgroundColor = backgroundColor;
    if (textColor !== undefined) banner.textColor = textColor;
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (buttonLink !== undefined) banner.buttonLink = buttonLink;
    if (image !== undefined) banner.image = image;
    if (isActive !== undefined) banner.isActive = isActive;
    if (order !== undefined) banner.order = order;
    if (startDate !== undefined) banner.startDate = new Date(startDate);
    if (endDate !== undefined) banner.endDate = endDate ? new Date(endDate) : null;

    await banner.save();
    res.json(banner);
  } catch (err) {
    console.error("Error updating promotional banner:", err);
    res.status(500).json({ message: "Could not update promotional banner", error: err.message });
  }
});

// DELETE /api/promotional-banners/:id - Delete banner (admin or provider - can only delete their own)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin, superadmin, or provider
    if (!["admin", "superadmin", "provider"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const banner = await PromotionalBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Promotional banner not found" });
    }

    // Providers can only delete their own banners, admins can delete any
    if (req.user.role === "provider" && banner.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only delete your own promotional banners" });
    }

    await PromotionalBanner.findByIdAndDelete(req.params.id);

    res.json({ message: "Promotional banner deleted successfully" });
  } catch (err) {
    console.error("Error deleting promotional banner:", err);
    res.status(500).json({ message: "Could not delete promotional banner", error: err.message });
  }
});

module.exports = router;

