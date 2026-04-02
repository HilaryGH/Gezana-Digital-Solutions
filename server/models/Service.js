const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema(
  {
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
  { _id: false }
);

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
      type: pointSchema,
      default: undefined
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

// Only index services that have valid GeoJSON coordinates.
serviceSchema.index(
  { coordinates: '2dsphere' },
  { sparse: true }
);

// Normalize possible string/number inputs into a finite number.
const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

// Pre-save middleware to sync latitude/longitude with coordinates
serviceSchema.pre('save', function(next) {
  const lat = toFiniteNumber(this.latitude);
  const lon = toFiniteNumber(this.longitude);

  // If latitude and longitude are provided, always construct valid GeoJSON.
  if (lat != null && lon != null && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
    this.latitude = lat;
    this.longitude = lon;
    this.coordinates = {
      type: 'Point',
      coordinates: [lon, lat] // GeoJSON format: [longitude, latitude]
    };
    return next();
  }

  const rawCoords = this.coordinates && this.coordinates.coordinates;
  if (Array.isArray(rawCoords) && rawCoords.length === 2) {
    const coordLon = toFiniteNumber(rawCoords[0]);
    const coordLat = toFiniteNumber(rawCoords[1]);

    if (
      coordLon != null &&
      coordLat != null &&
      coordLat >= -90 &&
      coordLat <= 90 &&
      coordLon >= -180 &&
      coordLon <= 180
    ) {
      this.longitude = coordLon;
      this.latitude = coordLat;
      this.coordinates = {
        type: 'Point',
        coordinates: [coordLon, coordLat]
      };
      return next();
    }
  }

  // If coordinates are incomplete/invalid, remove them so 2dsphere index doesn't fail.
  this.coordinates = undefined;
  next();
});

module.exports = mongoose.model("Service", serviceSchema);

