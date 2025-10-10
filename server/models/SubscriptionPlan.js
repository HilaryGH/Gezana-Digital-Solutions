const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "ETB", // Ethiopian Birr
    },
    duration: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["day", "week", "month", "year"],
        default: "month",
      },
    },
    features: [
      {
        name: String,
        included: Boolean,
        limit: Number, // null for unlimited
      },
    ],
    // For providers
    maxServices: {
      type: Number,
      default: null, // null = unlimited
    },
    maxBookingsPerMonth: {
      type: Number,
      default: null,
    },
    commissionRate: {
      type: Number,
      default: 15, // Percentage
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "premium"],
      default: "medium",
    },
    // For seekers
    maxBookingsAsSeeker: {
      type: Number,
      default: null,
    },
    discountRate: {
      type: Number,
      default: 0, // Percentage discount on bookings
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    trialDays: {
      type: Number,
      default: 0,
    },
    // Applicable to
    applicableTo: {
      type: String,
      enum: ["provider", "seeker", "both"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);



