const mongoose = require("mongoose");

const agentProfessionalSchema = new mongoose.Schema(
  {
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Basic info
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    whatsapp: { type: String },
    telegram: { type: String },
    city: { type: String },
    location: { type: String },
    serviceType: { type: String },
    notes: { type: String },
    /** Profile image: Cloudinary URL or local uploads filename */
    photo: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

agentProfessionalSchema.index({ agent: 1, createdAt: -1 });

module.exports = mongoose.model("AgentProfessional", agentProfessionalSchema);

