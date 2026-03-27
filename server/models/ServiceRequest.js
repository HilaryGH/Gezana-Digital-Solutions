const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, required: false, trim: true },
    location: { type: String, required: true, trim: true },
    serviceNeeded: { type: String, required: true, trim: true },
    preferredDate: { type: Date, required: false },
    budgetEtb: { type: Number, required: false, min: 0 },
    details: { type: String, required: true, trim: true, maxlength: 2000 },
    photoUrls: [{ type: String, trim: true }],
    videoUrl: { type: String, required: false, trim: true },
    videoDurationSeconds: { type: Number, required: false, min: 0, max: 1800 },
    status: {
      type: String,
      enum: ["new", "reviewing", "matched", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
