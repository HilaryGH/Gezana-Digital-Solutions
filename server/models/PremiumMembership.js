const mongoose = require("mongoose");

const premiumMembershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      enum: ["individual-monthly", "individual-yearly", "corporate-monthly", "corporate-yearly"],
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    period: {
      type: String,
      enum: ["month", "year"],
      required: true,
    },
    // Form data
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "",
    },
    renewalStatus: {
      type: String,
      enum: ["New Membership", "Renewal", "Upgrade", "Downgrade"],
      default: "New Membership",
    },
    goals: {
      type: String,
      default: "",
    },
    // Payment details
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "mobile_money", "cash"],
    },
    transactionId: {
      type: String,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Dates
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
    },
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Generate invoice number before saving
premiumMembershipSchema.pre("save", async function (next) {
  if (!this.invoiceNumber && this.paymentStatus === "paid") {
    const count = await mongoose.model("PremiumMembership").countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// Index for efficient queries
premiumMembershipSchema.index({ user: 1, status: 1 });
premiumMembershipSchema.index({ paymentStatus: 1 });
premiumMembershipSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model("PremiumMembership", premiumMembershipSchema);








