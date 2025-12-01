const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for guest applications
    },
    // Guest information for non-logged-in users
    guestInfo: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
      alternativePhone: { type: String },
      dateOfBirth: { type: String },
      gender: { type: String },
      nationality: { type: String },
      address: { type: String },
      city: { type: String },
      country: { type: String },
    },
    coverLetter: {
      type: String,
      required: true,
    },
    resume: {
      type: String, // File path
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "accepted"],
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

module.exports = mongoose.model("JobApplication", jobApplicationSchema);

