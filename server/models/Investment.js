const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["investor", "strategic-partner", "sponsorship"],
    },
    // Common fields
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
    },
    companyName: {
      type: String,
    },
    // Investor specific fields
    sector: {
      type: String,
    },
    investmentType: {
      type: String,
    },
    // Strategic Partner specific fields
    // (sector is already covered above)
    // Sponsorship specific fields
    officePhone: {
      type: String,
    },
    motto: {
      type: String,
    },
    specialPackages: {
      type: String,
    },
    messages: {
      type: String,
    },
    effectiveDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    // Attachments
    attachments: {
      idPassport: { type: String },
      license: { type: String },
      tradeRegistration: { type: String },
      businessProposal: { type: String },
      businessPlan: { type: String },
      logo: { type: String },
      mouSigned: { type: String },
      contractSigned: { type: String },
    },
    // Common message field
    enquiries: {
      type: String,
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

module.exports = mongoose.model("Investment", investmentSchema);


