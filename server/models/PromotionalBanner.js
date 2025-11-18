const mongoose = require("mongoose");

const promotionalBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: "✨", // Emoji or icon identifier
    },
    backgroundColor: {
      type: String,
      default: "from-blue-500 via-blue-600 to-blue-700", // Tailwind gradient classes
    },
    textColor: {
      type: String,
      default: "text-white",
    },
    buttonText: {
      type: String,
      default: "Learn More",
    },
    buttonLink: {
      type: String,
      default: "/services",
    },
    image: {
      type: String, // Optional image URL
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0, // For ordering banners
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date, // Optional expiration date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index for active banners ordered by priority
promotionalBannerSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model("PromotionalBanner", promotionalBannerSchema);

