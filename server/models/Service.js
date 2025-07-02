const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceType", // ✅ updated ref
      required: true,
    },

    description: { type: String },
    price: { type: Number, required: true },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    idCard: { type: String },
    businessLicense: { type: String },
    skillLicense: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);

