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
      required: function() {
        return !this.googleId && !this.facebookId;
      },
    },
    // Social authentication fields
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
    avatar: { type: String }, // Profile picture from social providers
    
    // Language preference
    language: { 
      type: String, 
      enum: ["en", "am"], 
      default: "en" 
    },
    role: {
      type: String,
      enum: ["seeker", "provider", "admin", "superadmin", "support", "marketing"],
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
    // GeoJSON location for geospatial queries
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: undefined
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined
      },
      _id: false // Disable _id for subdocuments
    },
    // Convenience fields for easy access
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    whatsapp: { type: String },
    telegram: { type: String },
    idFile: { type: String }, // File path
    
    // Provider specific fields
    subRole: {
      type: String,
      enum: ["freelancer", "smallBusiness", "specializedBusiness"],
    },
    serviceCategory: {
      type: String,
      enum: ["freelance", "fulltime"],
    },
    freelanceSubCategory: {
      type: String,
      enum: ["professionalSkilled", "smallBusiness", "specializedCompany"],
    },
    companyName: { type: String },
    serviceType: { type: String },
    alternativePhone: { type: String },
    officePhone: { type: String },
    city: { type: String },
    location: { type: String },
    tin: { type: String },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    femaleLedOrOwned: {
      type: String,
      enum: ["female-led", "female-owned", "non-female"],
    },
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
    credentials: [{ type: String }], // Additional credential uploads
    
    // Provider duty status
    isOnDuty: { type: Boolean, default: false },
    dutySchedules: [{
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      startTime: { type: String, required: true }, // Format: "HH:MM"
      endTime: { type: String, required: true }, // Format: "HH:MM"
      isOnDuty: { type: Boolean, default: true },
      daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0 = Sunday, 1 = Monday, etc.
      createdAt: { type: Date, default: Date.now }
    }],
    
    // Verification status
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    verificationNotes: { type: String },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: { type: Date },
    
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
    
    // Password reset fields
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    
    // Referral fields
    referralCode: { 
      type: String, 
      unique: true, 
      sparse: true // Allows null values but enforces uniqueness for non-null values
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    referralCount: {
      type: Number,
      default: 0
    },
    referralEarnings: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Create 2dsphere index for geospatial queries (sparse index - only indexes documents with valid coordinates)
userSchema.index({ coordinates: '2dsphere' }, { sparse: true });

// Index for referral code lookups
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });

// Pre-save middleware to sync latitude/longitude with coordinates
userSchema.pre('save', function(next) {
  try {
    // If latitude and longitude are provided, update coordinates
    if (this.latitude != null && this.longitude != null && 
        typeof this.latitude === 'number' && typeof this.longitude === 'number' &&
        !isNaN(this.latitude) && !isNaN(this.longitude)) {
      this.coordinates = {
        type: 'Point',
        coordinates: [this.longitude, this.latitude] // GeoJSON format: [longitude, latitude]
      };
    }
    // If coordinates are provided, update latitude and longitude
    else if (this.coordinates && this.coordinates.coordinates && 
             Array.isArray(this.coordinates.coordinates) && 
             this.coordinates.coordinates.length === 2 &&
             typeof this.coordinates.coordinates[0] === 'number' &&
             typeof this.coordinates.coordinates[1] === 'number') {
      this.longitude = this.coordinates.coordinates[0];
      this.latitude = this.coordinates.coordinates[1];
    }
    // If coordinates is invalid, clear it
    else if (this.coordinates && (!this.coordinates.coordinates || 
             !Array.isArray(this.coordinates.coordinates) || 
             this.coordinates.coordinates.length !== 2)) {
      this.coordinates = undefined;
    }
  } catch (error) {
    console.error('Error in pre-save middleware for coordinates:', error);
    // Clear invalid coordinates to prevent save errors
    if (this.coordinates && (!this.coordinates.coordinates || !Array.isArray(this.coordinates.coordinates))) {
      this.coordinates = undefined;
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
