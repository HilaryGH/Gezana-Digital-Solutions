const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  referralCode: {
    type: String,
    required: true
  },
  usedInRegistration: {
    type: Boolean,
    default: false
  },
  usedInPurchase: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    default: null
  },
  rewardAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending"
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Index for efficient queries
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referredUser: 1 });
referralSchema.index({ referralCode: 1 });

module.exports = mongoose.model("Referral", referralSchema);


