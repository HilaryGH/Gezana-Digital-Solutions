const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
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
  phone: { type: String, required: false }, // add this line
seekerType: {
  type: String,
  enum: ["individual", "service"],
  default: "individual", // optional fallback
},
 // ✅ new field
     isActive: { type: Boolean, default: true }, // ✅ Add this line
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
