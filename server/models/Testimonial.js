const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false, // Optional for privacy
    },
    photo: {
      type: String,
      default: "https://randomuser.me/api/portraits/lego/1.jpg", // Default avatar
    },
    text: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    isApproved: {
      type: Boolean,
      default: false, // Admin needs to approve testimonials
    },
    isActive: {
      type: Boolean,
      default: true, // To hide/show testimonials without deleting
    },
    order: {
      type: Number,
      default: 0, // For ordering testimonials
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);

