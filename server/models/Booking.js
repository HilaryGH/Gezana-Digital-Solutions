const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  serviceType: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceType", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true }, // ✅ ADD THIS LINE
  date: { type: Date, required: true },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  note: { type: String },
  status: { type: String, default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);


