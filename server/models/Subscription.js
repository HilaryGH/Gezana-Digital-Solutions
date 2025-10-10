const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "paused", "trial"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    trialEndDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    // Payment details
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "mobile_money", "cash"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    amountPaid: {
      type: Number,
    },
    // Usage tracking
    usage: {
      servicesCreated: {
        type: Number,
        default: 0,
      },
      bookingsReceived: {
        type: Number,
        default: 0,
      },
      bookingsMade: {
        type: Number,
        default: 0,
      },
    },
    // Cancellation details
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function () {
  return (
    this.status === "active" &&
    this.endDate > new Date() &&
    this.paymentStatus === "paid"
  );
};

// Method to check if in trial period
subscriptionSchema.methods.isInTrial = function () {
  return (
    this.status === "trial" &&
    this.trialEndDate &&
    this.trialEndDate > new Date()
  );
};

// Static method to find active subscription for user
subscriptionSchema.statics.findActiveForUser = function (userId) {
  return this.findOne({
    user: userId,
    status: { $in: ["active", "trial"] },
    endDate: { $gt: new Date() },
  }).populate("plan");
};

module.exports = mongoose.model("Subscription", subscriptionSchema);



