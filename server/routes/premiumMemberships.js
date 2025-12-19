const express = require("express");
const router = express.Router();
const PremiumMembership = require("../models/PremiumMembership");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");

// Middleware to check if user is admin or superadmin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!["admin", "superadmin"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin access required",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking admin status",
    });
  }
};

// Create a new premium membership request
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      planType,
      planName,
      price,
      period,
      fullName,
      email,
      phone,
      organization,
      role,
      renewalStatus,
      goals,
    } = req.body;

    if (!planType || !planName || !price || !period || !fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Calculate end date based on period
    const startDate = new Date();
    const endDate = new Date();
    if (period === "month") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (period === "year") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const membership = new PremiumMembership({
      user: req.user.userId,
      planType,
      planName,
      price,
      period,
      fullName,
      email,
      phone,
      organization: organization || "",
      role: role || "",
      renewalStatus: renewalStatus || "New Membership",
      goals: goals || "",
      startDate,
      endDate,
      status: "pending",
      paymentStatus: "pending",
    });

    await membership.save();
    await membership.populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Premium membership request created successfully",
      membership,
    });
  } catch (error) {
    console.error("Error creating premium membership:", error);
    res.status(500).json({
      success: false,
      message: "Error creating premium membership request",
      error: error.message,
    });
  }
});

// Get all premium memberships (Admin/Superadmin only)
router.get("/admin/all", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const memberships = await PremiumMembership.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PremiumMembership.countDocuments(query);

    res.json({
      success: true,
      memberships,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching premium memberships:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching premium memberships",
    });
  }
});

// Get user's premium memberships
router.get("/my-memberships", authMiddleware, async (req, res) => {
  try {
    const memberships = await PremiumMembership.find({ user: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      memberships,
    });
  } catch (error) {
    console.error("Error fetching user memberships:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching memberships",
    });
  }
});

// Get single membership by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const membership = await PremiumMembership.findById(req.params.id)
      .populate("user", "name email role");

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    // Check if user has access (owner or admin)
    const user = await User.findById(req.user.userId);
    if (
      membership.user._id.toString() !== req.user.userId &&
      !["admin", "superadmin"].includes(user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    res.json({
      success: true,
      membership,
    });
  } catch (error) {
    console.error("Error fetching membership:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching membership",
    });
  }
});

// Update membership (Admin/Superadmin only)
router.put("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const membership = await PremiumMembership.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("user", "name email role");

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    res.json({
      success: true,
      message: "Membership updated successfully",
      membership,
    });
  } catch (error) {
    console.error("Error updating membership:", error);
    res.status(500).json({
      success: false,
      message: "Error updating membership",
      error: error.message,
    });
  }
});

// Update payment status
router.patch("/:id/payment", authMiddleware, async (req, res) => {
  try {
    const { paymentStatus, transactionId, paymentMethod } = req.body;
    const membership = await PremiumMembership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    // Check if user has access
    const user = await User.findById(req.user.userId);
    if (
      membership.user.toString() !== req.user.userId &&
      !["admin", "superadmin"].includes(user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    membership.paymentStatus = paymentStatus || membership.paymentStatus;
    if (transactionId) membership.transactionId = transactionId;
    if (paymentMethod) membership.paymentMethod = paymentMethod;

    // If payment is successful (paid), activate membership and generate invoice
    if (paymentStatus === "paid") {
      if (membership.status === "pending") {
        membership.status = "active";
        membership.startDate = new Date();
        const endDate = new Date();
        if (membership.period === "month") {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (membership.period === "year") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        membership.endDate = endDate;
      }
      
      // Generate invoice number if not exists (for both cash and online payments)
      if (!membership.invoiceNumber) {
        try {
          const count = await PremiumMembership.countDocuments();
          membership.invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;
        } catch (countError) {
          console.error("Error counting memberships for invoice:", countError);
          // Fallback to timestamp-based invoice number
          membership.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        }
      }
    }

    await membership.save();
    await membership.populate("user", "name email role");

    res.json({
      success: true,
      message: "Payment status updated",
      membership,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message,
    });
  }
});

// Delete membership (Admin/Superadmin only)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const membership = await PremiumMembership.findByIdAndDelete(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    res.json({
      success: true,
      message: "Membership deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting membership:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting membership",
    });
  }
});

// Get invoice
router.get("/:id/invoice", authMiddleware, async (req, res) => {
  try {
    const membership = await PremiumMembership.findById(req.params.id)
      .populate("user", "name email role");

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: "Membership not found",
      });
    }

    // Check if user has access
    const user = await User.findById(req.user.userId);
    if (
      membership.user._id.toString() !== req.user.userId &&
      !["admin", "superadmin"].includes(user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Generate invoice data
    // Generate 4-digit invoice number if not exists
    let invoiceNumber = membership.invoiceNumber;
    if (!invoiceNumber && membership.paymentStatus === "paid") {
      try {
        const count = await PremiumMembership.countDocuments();
        invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;
        // Save invoice number to membership
        membership.invoiceNumber = invoiceNumber;
        await membership.save();
      } catch (countError) {
        console.error("Error generating invoice number:", countError);
        // Fallback to timestamp-based invoice number
        invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      }
    }
    const invoice = {
      invoiceNumber: invoiceNumber,
      date: membership.createdAt,
      membershipId: membership._id,
      customer: {
        name: membership.fullName,
        email: membership.email,
        phone: membership.phone,
        organization: membership.organization,
        role: membership.role,
      },
      plan: {
        name: membership.planName,
        type: membership.planType,
        period: membership.period,
      },
      amount: {
        subtotal: membership.price,
        tax: 0, // Add tax if needed
        total: membership.price,
        currency: "ETB",
      },
      payment: {
        status: membership.paymentStatus,
        method: membership.paymentMethod,
        transactionId: membership.transactionId,
        paidAt: membership.paymentStatus === "paid" ? membership.updatedAt : null,
      },
      dates: {
        startDate: membership.startDate,
        endDate: membership.endDate,
      },
    };

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Error generating invoice",
    });
  }
});

module.exports = router;























