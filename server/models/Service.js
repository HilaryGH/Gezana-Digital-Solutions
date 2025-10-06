const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    category: { 
      type: String, 
      required: true 
    },

    type: { 
      type: String, 
      required: true 
    },

    description: { type: String },
    price: { type: Number, required: true },
    priceType: { 
      type: String, 
      enum: ['fixed', 'hourly', 'per_sqft', 'custom'], 
      default: 'fixed' 
    },
    location: { type: String },
    photos: [{ type: String }], // Array of photo paths
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    // Keep old fields for backward compatibility
    idCard: { type: String },
    businessLicense: { type: String },
    skillLicense: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);

