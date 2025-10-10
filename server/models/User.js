const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic fields
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["seeker", "provider", "admin"],
      default: "seeker",
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    phone: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    
    // Seeker specific fields
    seekerType: {
      type: String,
      enum: ["individual", "service"],
      default: "individual",
    },
    address: { type: String },
    whatsapp: { type: String },
    telegram: { type: String },
    idFile: { type: String }, // File path
    
    // Provider specific fields
    subRole: {
      type: String,
      enum: ["freelancer", "smallBusiness", "specializedBusiness"],
    },
    companyName: { type: String },
    serviceType: { type: String },
    alternativePhone: { type: String },
    officePhone: { type: String },
    city: { type: String },
    location: { type: String },
    tin: { type: String },
    businessStatus: [{ type: String }],
    
    // Provider branches
    branches: [{
      city: { type: String },
      location: { type: String }
    }],
    
    // Provider bank accounts
    banks: [{
      bankName: { type: String },
      accountNumber: { type: String }
    }],
    
    // Provider documents
    license: { type: String }, // File path
    tradeRegistration: { type: String }, // File path
    professionalCertificate: { type: String }, // File path
    photo: { type: String }, // File path
    servicePhotos: [{ type: String }], // Array of file paths
    video: { type: String }, // File path
    priceList: { type: String }, // File path
    
    // Verification status
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    
    // Subscription fields
    currentSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    subscriptionStatus: {
      type: String,
      enum: ["none", "trial", "active", "expired", "cancelled"],
      default: "none",
    },
    subscriptionHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
