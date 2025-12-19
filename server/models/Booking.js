const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Made optional for guest bookings
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  serviceType: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceType", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  date: { type: Date, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online"],
    default: "cash",
  },
  note: { type: String },
  status: { type: String, default: "pending" },
  // Distance in kilometers between seeker and provider
  distance: {
    type: Number,
    default: null
  },
  // Guest information for non-logged-in users
  guestInfo: {
    fullName: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String }
  },
  // Referral code used for this booking
  referralCode: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);


