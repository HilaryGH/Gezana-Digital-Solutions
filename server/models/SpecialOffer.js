const mongoose = require("mongoose");

const specialOfferSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUses: {
      type: Number,
      default: null, // null = unlimited
    },
    currentUses: {
      type: Number,
      default: 0,
    },
    // Optional image for the offer
    image: {
      type: String,
    },
    // Terms and conditions
    terms: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
specialOfferSchema.index({ provider: 1, isActive: 1 });
specialOfferSchema.index({ service: 1, isActive: 1 });
specialOfferSchema.index({ endDate: 1, isActive: 1 });

// Virtual to check if offer is currently valid
specialOfferSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.maxUses === null || this.currentUses < this.maxUses)
  );
});

// Method to check if offer can be used
specialOfferSchema.methods.canBeUsed = function () {
  const now = new Date();
  if (!this.isActive) return false;
  if (now < this.startDate || now > this.endDate) return false;
  if (this.maxUses !== null && this.currentUses >= this.maxUses) return false;
  return true;
};

// Method to increment usage
specialOfferSchema.methods.incrementUsage = async function () {
  if (this.maxUses !== null) {
    this.currentUses += 1;
    await this.save();
  }
};

module.exports = mongoose.model("SpecialOffer", specialOfferSchema);



















