const Subscription = require("../models/Subscription");
const SubscriptionPlan = require("../models/SubscriptionPlan");

// Middleware to check if user has an active subscription
const requireActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const subscription = await Subscription.findActiveForUser(userId);

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: "Active subscription required",
        code: "NO_ACTIVE_SUBSCRIPTION",
      });
    }

    // Check if subscription is actually active
    if (!subscription.isActive() && !subscription.isInTrial()) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired",
        code: "SUBSCRIPTION_EXPIRED",
      });
    }

    // Attach subscription to request
    req.subscription = subscription;
    req.plan = subscription.plan;

    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking subscription status",
    });
  }
};

// Middleware to check if user can create more services
const checkServiceLimit = async (req, res, next) => {
  try {
    const subscription = req.subscription;
    const plan = req.plan;

    // If no limit, allow
    if (!plan.maxServices) {
      return next();
    }

    // Check current usage
    if (subscription.usage.servicesCreated >= plan.maxServices) {
      return res.status(403).json({
        success: false,
        message: `Service limit reached. Your plan allows ${plan.maxServices} services.`,
        code: "SERVICE_LIMIT_REACHED",
        limit: plan.maxServices,
        current: subscription.usage.servicesCreated,
      });
    }

    next();
  } catch (error) {
    console.error("Service limit check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking service limit",
    });
  }
};

// Middleware to check if user can create more bookings
const checkBookingLimit = async (req, res, next) => {
  try {
    const subscription = req.subscription;
    const plan = req.plan;

    // Determine which limit to check based on user role
    const limit = req.user.role === "provider" 
      ? plan.maxBookingsPerMonth 
      : plan.maxBookingsAsSeeker;

    // If no limit, allow
    if (!limit) {
      return next();
    }

    // Check current usage
    const usageField = req.user.role === "provider" 
      ? subscription.usage.bookingsReceived 
      : subscription.usage.bookingsMade;

    if (usageField >= limit) {
      return res.status(403).json({
        success: false,
        message: `Booking limit reached. Your plan allows ${limit} bookings per month.`,
        code: "BOOKING_LIMIT_REACHED",
        limit: limit,
        current: usageField,
      });
    }

    next();
  } catch (error) {
    console.error("Booking limit check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking booking limit",
    });
  }
};

// Middleware to attach subscription info (doesn't block if no subscription)
const attachSubscriptionInfo = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const subscription = await Subscription.findActiveForUser(userId);

    if (subscription) {
      req.subscription = subscription;
      req.plan = subscription.plan;
      req.hasActiveSubscription = subscription.isActive() || subscription.isInTrial();
    } else {
      req.hasActiveSubscription = false;
    }

    next();
  } catch (error) {
    console.error("Attach subscription info error:", error);
    req.hasActiveSubscription = false;
    next();
  }
};

module.exports = {
  requireActiveSubscription,
  checkServiceLimit,
  checkBookingLimit,
  attachSubscriptionInfo,
};



