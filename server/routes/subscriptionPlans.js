const express = require("express");
const router = express.Router();
const SubscriptionPlan = require("../models/SubscriptionPlan");
const { authMiddleware } = require("../middleware/authMiddleware");
const User = require("../models/User");

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== "admin") {
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

// Create a new subscription plan (Admin only)
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const plan = new SubscriptionPlan(req.body);
    await plan.save();

    res.json({
      success: true,
      message: "Subscription plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({
      success: false,
      message: "Error creating subscription plan",
      error: error.message,
    });
  }
});

// Get all subscription plans (Admin only)
router.get("/admin/all", authMiddleware, isAdmin, async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching plans",
    });
  }
});

// Update a subscription plan (Admin only)
router.put("/:planId", authMiddleware, isAdmin, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.planId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.json({
      success: true,
      message: "Plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({
      success: false,
      message: "Error updating plan",
      error: error.message,
    });
  }
});

// Delete a subscription plan (Admin only)
router.delete("/:planId", authMiddleware, isAdmin, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting plan",
    });
  }
});

// Toggle plan active status (Admin only)
router.patch("/:planId/toggle-status", authMiddleware, isAdmin, async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.json({
      success: true,
      message: `Plan ${plan.isActive ? "activated" : "deactivated"} successfully`,
      plan,
    });
  } catch (error) {
    console.error("Error toggling plan status:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling plan status",
    });
  }
});

module.exports = router;





