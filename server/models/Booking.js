const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Made optional for guest bookings
  /** service = marketplace provider listing; professional = agent-submitted professional */
  bookingKind: {
    type: String,
    enum: ["service", "professional"],
    default: "service",
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  serviceType: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceType", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: false },
  agentProfessional: { type: mongoose.Schema.Types.ObjectId, ref: "AgentProfessional", required: false },
  /** Listing agent (denormalized from AgentProfessional.agent) for commissions and reporting */
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  /** Agreed amount for agent-listed professional bookings (ETB) */
  professionalPrice: { type: Number, default: null },
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


