const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for guest reviews
    },
    // Guest information for non-logged-in users
    guestInfo: {
      name: { type: String },
      email: { type: String }
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve reviews, admin can moderate later
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews from same user for same service (only if user exists)
// Note: Guest reviews are allowed multiple times, but we can add email-based deduplication if needed

// Index for faster queries
reviewSchema.index({ service: 1, isActive: 1, isApproved: 1 });

module.exports = mongoose.model("Review", reviewSchema);








