const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0, // For ordering team members
    },
    isActive: {
      type: Boolean,
      default: true, // To hide/show team members without deleting
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);

