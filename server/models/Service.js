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
    location: { type: String }, // Keep for backward compatibility
    // GeoJSON location for geospatial queries
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined
      }
    },
    // Convenience fields for easy access (optional, can be derived from coordinates)
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

// Create 2dsphere index for geospatial queries
serviceSchema.index({ coordinates: '2dsphere' });

// Pre-save middleware to sync latitude/longitude with coordinates
serviceSchema.pre('save', function(next) {
  // If latitude and longitude are provided, update coordinates
  if (this.latitude != null && this.longitude != null) {
    this.coordinates = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude] // GeoJSON format: [longitude, latitude]
    };
  }
  // If coordinates are provided, update latitude and longitude
  else if (this.coordinates && this.coordinates.coordinates && this.coordinates.coordinates.length === 2) {
    this.longitude = this.coordinates.coordinates[0];
    this.latitude = this.coordinates.coordinates[1];
  }
  next();
});

module.exports = mongoose.model("Service", serviceSchema);

