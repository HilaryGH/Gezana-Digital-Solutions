const express = require("express");
const router = express.Router();
const WomenInitiative = require("../models/WomenInitiative");
const { authMiddleware } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/upload");
const { getFileUrl } = require("../utils/fileHelper");

/**
 * POST /api/women-initiatives - Submit women initiative application
 */
router.post("/", upload.fields([
  { name: 'idPassport', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'certificates', maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      fullName,
      age,
      email,
      phone,
      whatsapp,
      telegram,
      location,
      city,
    } = req.body;

    // Validation
    if (!fullName || !age || !email) {
      return res.status(400).json({ message: "Full name, age, and email are required" });
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return res.status(400).json({ message: "Invalid age" });
    }

    // Handle file uploads
    const attachments = {};
    if (req.files) {
      if (req.files.idPassport) attachments.idPassport = getFileUrl(req.files.idPassport[0]);
      if (req.files.profilePhoto) attachments.profilePhoto = getFileUrl(req.files.profilePhoto[0]);
      if (req.files.certificates) attachments.certificates = getFileUrl(req.files.certificates[0]);
    }

    // Validate required files
    if (!attachments.idPassport || !attachments.profilePhoto) {
      return res.status(400).json({ message: "ID/Passport and Profile Photo are required" });
    }

    // Create women initiative record
    const womenInitiative = new WomenInitiative({
      fullName,
      age: ageNum,
      email,
      phone: phone || undefined,
      whatsapp: whatsapp || undefined,
      telegram: telegram || undefined,
      location: location || undefined,
      city: city || undefined,
      attachments: Object.keys(attachments).length > 0 ? attachments : undefined,
      status: "pending",
    });

    await womenInitiative.save();

    res.status(201).json({
      message: "Women initiative application submitted successfully",
      womenInitiative,
    });
  } catch (error) {
    console.error("Error creating women initiative application:", error);
    res.status(500).json({
      message: "Failed to submit application",
      error: error.message,
    });
  }
});

/**
 * GET /api/women-initiatives - Get all women initiatives (admin/superadmin only)
 */
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const womenInitiatives = await WomenInitiative.find().sort({ createdAt: -1 });
    res.json(womenInitiatives);
  } catch (error) {
    console.error("Error fetching women initiatives:", error);
    res.status(500).json({
      message: "Failed to fetch women initiatives",
      error: error.message,
    });
  }
});

/**
 * GET /api/women-initiatives/:id - Get single women initiative (admin/superadmin only)
 */
router.get("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const womenInitiative = await WomenInitiative.findById(req.params.id);
    if (!womenInitiative) {
      return res.status(404).json({ message: "Women initiative not found" });
    }
    res.json(womenInitiative);
  } catch (error) {
    console.error("Error fetching women initiative:", error);
    res.status(500).json({
      message: "Failed to fetch women initiative",
      error: error.message,
    });
  }
});

/**
 * PUT /api/women-initiatives/:id/status - Update women initiative status (admin/superadmin only)
 */
router.put("/:id/status", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !["pending", "reviewed", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const womenInitiative = await WomenInitiative.findById(req.params.id);
    if (!womenInitiative) {
      return res.status(404).json({ message: "Women initiative not found" });
    }

    womenInitiative.status = status;
    if (notes) womenInitiative.notes = notes;

    await womenInitiative.save();

    res.json(womenInitiative);
  } catch (error) {
    console.error("Error updating women initiative status:", error);
    res.status(500).json({
      message: "Failed to update women initiative",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/women-initiatives/:id - Delete women initiative (admin/superadmin only)
 */
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const womenInitiative = await WomenInitiative.findById(req.params.id);
    if (!womenInitiative) {
      return res.status(404).json({ message: "Women initiative not found" });
    }

    await WomenInitiative.findByIdAndDelete(req.params.id);

    res.json({ message: "Women initiative deleted successfully" });
  } catch (error) {
    console.error("Error deleting women initiative:", error);
    res.status(500).json({
      message: "Failed to delete women initiative",
      error: error.message,
    });
  }
});

module.exports = router;

