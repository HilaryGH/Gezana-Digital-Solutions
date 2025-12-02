const mongoose = require("mongoose");

const womenInitiativeSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    whatsapp: {
      type: String,
    },
    telegram: {
      type: String,
    },
    location: {
      type: String,
    },
    city: {
      type: String,
    },
    attachments: {
      idPassport: { type: String },
      profilePhoto: { type: String },
      certificates: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
    notes: {
      type: String, // Admin notes
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WomenInitiative", womenInitiativeSchema);

