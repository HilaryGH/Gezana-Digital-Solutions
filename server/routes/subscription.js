const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");

// Get all subscription plans
router.get("/plans", async (req, res) => {
  try {
    const { applicableTo } = req.query;

    let query = { isActive: true };
    if (applicableTo) {
      query.applicableTo = { $in: [applicableTo, "both"] };
    }

    const plans = await SubscriptionPlan.find(query).sort({ price: 1 });

    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscription plans",
    });
  }
});

// Get a specific plan
router.get("/plans/:planId", async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching plan",
    });
  }
});

// Get current user's active subscription
router.get("/my-subscription", authMiddleware, async (req, res) => {
  try {
    const subscription = await Subscription.findActiveForUser(req.user.userId);

    if (!subscription) {
      return res.json({
        success: true,
        hasSubscription: false,
        subscription: null,
      });
    }

    res.json({
      success: true,
      hasSubscription: true,
      subscription,
      isActive: subscription.isActive(),
      isInTrial: subscription.isInTrial(),
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscription",
    });
  }
});

// Get subscription history
router.get("/my-history", authMiddleware, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      user: req.user.userId,
    })
      .populate("plan")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscription history",
    });
  }
});

// Subscribe to a plan
router.post("/subscribe", authMiddleware, async (req, res) => {
  try {
    const { planId, paymentMethod, transactionId } = req.body;

    // Validate plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findActiveForUser(
      req.user.userId
    );

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "You already have an active subscription",
        subscription: existingSubscription,
      });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    let trialEndDate = null;

    if (plan.trialDays > 0) {
      trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + plan.trialDays);
    }

    // Add duration to end date
    switch (plan.duration.unit) {
      case "day":
        endDate.setDate(endDate.getDate() + plan.duration.value);
        break;
      case "week":
        endDate.setDate(endDate.getDate() + plan.duration.value * 7);
        break;
      case "month":
        endDate.setMonth(endDate.getMonth() + plan.duration.value);
        break;
      case "year":
        endDate.setFullYear(endDate.getFullYear() + plan.duration.value);
        break;
    }

    // Create subscription
    const subscription = new Subscription({
      user: req.user.userId,
      plan: planId,
      status: plan.trialDays > 0 ? "trial" : "active",
      startDate,
      endDate,
      trialEndDate,
      paymentMethod: paymentMethod || "pending",
      paymentStatus: plan.trialDays > 0 ? "paid" : "pending",
      transactionId,
      amountPaid: plan.trialDays > 0 ? 0 : plan.price,
    });

    await subscription.save();

    // Update user
    await User.findByIdAndUpdate(req.user.userId, {
      currentSubscription: subscription._id,
      subscriptionStatus: subscription.status,
      $push: { subscriptionHistory: subscription._id },
    });

    // Populate plan details
    await subscription.populate("plan");

    res.json({
      success: true,
      message: "Subscription created successfully",
      subscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      success: false,
      message: "Error creating subscription",
      error: error.message,
    });
  }
});

// Update payment status (for manual payment confirmation)
router.patch("/payment/:subscriptionId", authMiddleware, async (req, res) => {
  try {
    const { paymentStatus, transactionId, amountPaid } = req.body;

    const subscription = await Subscription.findOne({
      _id: req.params.subscriptionId,
      user: req.user.userId,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    subscription.paymentStatus = paymentStatus;
    if (transactionId) subscription.transactionId = transactionId;
    if (amountPaid) subscription.amountPaid = amountPaid;

    await subscription.save();

    res.json({
      success: true,
      message: "Payment status updated",
      subscription,
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
    });
  }
});

// Cancel subscription
router.post("/cancel/:subscriptionId", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;

    const subscription = await Subscription.findOne({
      _id: req.params.subscriptionId,
      user: req.user.userId,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    subscription.status = "cancelled";
    subscription.autoRenew = false;
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason;

    await subscription.save();

    // Update user
    await User.findByIdAndUpdate(req.user.userId, {
      subscriptionStatus: "cancelled",
    });

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling subscription",
    });
  }
});

// Renew subscription
router.post("/renew/:subscriptionId", authMiddleware, async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    const subscription = await Subscription.findOne({
      _id: req.params.subscriptionId,
      user: req.user.userId,
    }).populate("plan");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    const plan = subscription.plan;

    // Calculate new end date
    const newEndDate = new Date(subscription.endDate);
    switch (plan.duration.unit) {
      case "day":
        newEndDate.setDate(newEndDate.getDate() + plan.duration.value);
        break;
      case "week":
        newEndDate.setDate(newEndDate.getDate() + plan.duration.value * 7);
        break;
      case "month":
        newEndDate.setMonth(newEndDate.getMonth() + plan.duration.value);
        break;
      case "year":
        newEndDate.setFullYear(newEndDate.getFullYear() + plan.duration.value);
        break;
    }

    subscription.status = "active";
    subscription.endDate = newEndDate;
    subscription.paymentStatus = "pending";
    subscription.paymentMethod = paymentMethod;
    subscription.transactionId = transactionId;

    await subscription.save();

    // Update user
    await User.findByIdAndUpdate(req.user.userId, {
      subscriptionStatus: "active",
    });

    res.json({
      success: true,
      message: "Subscription renewed successfully",
      subscription,
    });
  } catch (error) {
    console.error("Error renewing subscription:", error);
    res.status(500).json({
      success: false,
      message: "Error renewing subscription",
    });
  }
});

// Admin: Get all subscriptions
router.get("/admin/all", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin (you should have admin middleware)
    const user = await User.findById(req.user.userId);
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const subscriptions = await Subscription.find(query)
      .populate("user", "name email role")
      .populate("plan")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Subscription.countDocuments(query);

    res.json({
      success: true,
      subscriptions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscriptions",
    });
  }
});

module.exports = router;



