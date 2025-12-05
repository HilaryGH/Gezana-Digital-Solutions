const express = require("express");
const router = express.Router();
const Investment = require("../models/Investment");
const { authMiddleware } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/upload");
const { getFileUrl } = require("../utils/fileHelper");

/**
 * POST /api/investments - Submit investment/partnership form
 */
router.post("/", upload.fields([
  { name: 'idPassport', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'tradeRegistration', maxCount: 1 },
  { name: 'businessProposal', maxCount: 1 },
  { name: 'businessPlan', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'mouSigned', maxCount: 1 },
  { name: 'contractSigned', maxCount: 1 },
]), async (req, res) => {
  try {
    const {
      type,
      name,
      email,
      phone,
      whatsapp,
      companyName,
      sector,
      investmentType,
      officePhone,
      motto,
      specialPackages,
      messages,
      effectiveDate,
      expiryDate,
      enquiries,
    } = req.body;

    // Validation
    if (!type || !["investor", "strategic-partner", "sponsorship"].includes(type)) {
      return res.status(400).json({ message: "Invalid investment type" });
    }

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, email, and phone are required" });
    }

    // Handle file uploads
    const attachments = {};
    if (req.files) {
      if (req.files.idPassport) attachments.idPassport = getFileUrl(req.files.idPassport[0]);
      if (req.files.license) attachments.license = getFileUrl(req.files.license[0]);
      if (req.files.tradeRegistration) attachments.tradeRegistration = getFileUrl(req.files.tradeRegistration[0]);
      if (req.files.businessProposal) attachments.businessProposal = getFileUrl(req.files.businessProposal[0]);
      if (req.files.businessPlan) attachments.businessPlan = getFileUrl(req.files.businessPlan[0]);
      if (req.files.logo) attachments.logo = getFileUrl(req.files.logo[0]);
      if (req.files.mouSigned) attachments.mouSigned = getFileUrl(req.files.mouSigned[0]);
      if (req.files.contractSigned) attachments.contractSigned = getFileUrl(req.files.contractSigned[0]);
    }

    // Create investment record
    const investment = new Investment({
      type,
      name,
      email,
      phone,
      whatsapp: whatsapp || undefined,
      companyName: companyName || undefined,
      sector: sector || undefined,
      investmentType: investmentType || undefined,
      officePhone: officePhone || undefined,
      motto: motto || undefined,
      specialPackages: specialPackages || undefined,
      messages: messages || undefined,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      attachments: Object.keys(attachments).length > 0 ? attachments : undefined,
      enquiries: enquiries || undefined,
      status: "pending",
    });

    await investment.save();

    res.status(201).json({
      message: "Investment/partnership application submitted successfully",
      investment,
    });
  } catch (error) {
    console.error("Error creating investment application:", error);
    res.status(500).json({
      message: "Failed to submit application",
      error: error.message,
    });
  }
});

/**
 * GET /api/investments - Get all investments (admin/superadmin only)
 */
router.get("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const investments = await Investment.find().sort({ createdAt: -1 });
    res.json(investments);
  } catch (error) {
    console.error("Error fetching investments:", error);
    res.status(500).json({
      message: "Failed to fetch investments",
      error: error.message,
    });
  }
});

/**
 * GET /api/investments/:id - Get single investment (admin/superadmin only)
 */
router.get("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }
    res.json(investment);
  } catch (error) {
    console.error("Error fetching investment:", error);
    res.status(500).json({
      message: "Failed to fetch investment",
      error: error.message,
    });
  }
});

/**
 * PUT /api/investments/:id/status - Update investment status (admin/superadmin only)
 */
router.put("/:id/status", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !["pending", "reviewed", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    investment.status = status;
    if (notes) investment.notes = notes;

    await investment.save();

    res.json(investment);
  } catch (error) {
    console.error("Error updating investment status:", error);
    res.status(500).json({
      message: "Failed to update investment",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/investments/:id - Delete investment (admin/superadmin only)
 */
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    await Investment.findByIdAndDelete(req.params.id);

    res.json({ message: "Investment deleted successfully" });
  } catch (error) {
    console.error("Error deleting investment:", error);
    res.status(500).json({
      message: "Failed to delete investment",
      error: error.message,
    });
  }
});

module.exports = router;









