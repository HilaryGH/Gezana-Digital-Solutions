const mongoose = require("mongoose");
const dotenv = require("dotenv");
const SubscriptionPlan = require("./models/SubscriptionPlan");

dotenv.config();

const subscriptionPlans = [
  // Provider Plans
  {
    name: "provider_free",
    displayName: "Free",
    description: "Perfect for individual freelancers starting out",
    price: 0,
    currency: "ETB",
    duration: {
      value: 1,
      unit: "month",
    },
    features: [
      { name: "List up to 3 services", included: true, limit: 3 },
      { name: "Receive up to 10 bookings/month", included: true, limit: 10 },
      { name: "Basic profile", included: true },
      { name: "Email support", included: true },
      { name: "15% commission on bookings", included: true },
    ],
    maxServices: 3,
    maxBookingsPerMonth: 10,
    commissionRate: 15,
    priority: "low",
    isActive: true,
    isPopular: false,
    trialDays: 0,
    applicableTo: "provider",
  },
  {
    name: "provider_basic",
    displayName: "Basic",
    description: "Great for growing service providers",
    price: 299,
    currency: "ETB",
    duration: {
      value: 1,
      unit: "month",
    },
    features: [
      { name: "List up to 10 services", included: true, limit: 10 },
      { name: "Receive up to 50 bookings/month", included: true, limit: 50 },
      { name: "Enhanced profile", included: true },
      { name: "Priority in search results", included: true },
      { name: "12% commission on bookings", included: true },
      { name: "Email & phone support", included: true },
    ],
    maxServices: 10,
    maxBookingsPerMonth: 50,
    commissionRate: 12,
    priority: "medium",
    isActive: true,
    isPopular: true,
    trialDays: 7,
    applicableTo: "provider",
  },
  {
    name: "provider_professional",
    displayName: "Professional",
    description: "For established businesses",
    price: 599,
    currency: "ETB",
    duration: {
      value: 1,
      unit: "month",
    },
    features: [
      { name: "Unlimited services", included: true, limit: null },
      { name: "Unlimited bookings", included: true, limit: null },
      { name: "Premium profile with badge", included: true },
      { name: "Top priority in search", included: true },
      { name: "10% commission on bookings", included: true },
      { name: "24/7 priority support", included: true },
      { name: "Analytics dashboard", included: true },
      { name: "Featured listing", included: true },
    ],
    maxServices: null,
    maxBookingsPerMonth: null,
    commissionRate: 10,
    priority: "high",
    isActive: true,
    isPopular: false,
    trialDays: 14,
    applicableTo: "provider",
  },
  {
    name: "provider_enterprise",
    displayName: "Enterprise",
    description: "For large businesses and agencies",
    price: 999,
    currency: "ETB",
    duration: {
      value: 1,
      unit: "month",
    },
    features: [
      { name: "Unlimited services", included: true, limit: null },
      { name: "Unlimited bookings", included: true, limit: null },
      { name: "Premium profile with badge", included: true },
      { name: "Top priority in search", included: true },
      { name: "8% commission on bookings", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Featured listing", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: true },
    ],
    maxServices: null,
    maxBookingsPerMonth: null,
    commissionRate: 8,
    priority: "premium",
    isActive: true,
    isPopular: false,
    trialDays: 30,
    applicableTo: "provider",
  },

  // Seeker Plans
  {
    name: "seeker_free",
    displayName: "Free",
    description: "For occasional service seekers",
    price: 0,
    currency: "ETB",
    duration: {
      value: 1,
      unit: "month",
    },
    features: [
      { name: "Browse all services", included: true },
      { name: "Up to 5 bookings/month", included: true, limit: 5 },
      { name: "Basic support", included: true },
      { name: "Standard booking", included: true },
    ],
    maxBookingsAsSeeker: 5,
    discountRate: 0,
    priority: "low",
    isActive: true,
    isPopular: false,
    trialDays: 0,
    applicableTo: "seeker",
  },
  {
    name: "seeker_premium",
    displayName: "Premium",
    description: "For frequent service seekers",
    price: 199,
    currency: "ETB",
    duration: {
      value: 1,
      unit: "month",
    },
    features: [
      { name: "Unlimited bookings", included: true },
      { name: "5% discount on all services", included: true },
      { name: "Priority booking", included: true },
      { name: "24/7 support", included: true },
      { name: "Loyalty rewards", included: true },
    ],
    maxBookingsAsSeeker: null,
    discountRate: 5,
    priority: "high",
    isActive: true,
    isPopular: true,
    trialDays: 7,
    applicableTo: "seeker",
  },
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log("🗑️  Cleared existing subscription plans");

    // Insert new plans
    await SubscriptionPlan.insertMany(subscriptionPlans);
    console.log("✅ Seeded subscription plans successfully");

    console.log("\n📋 Created plans:");
    subscriptionPlans.forEach((plan) => {
      console.log(`  - ${plan.displayName} (${plan.applicableTo}): ${plan.price} ETB/month`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding plans:", error);
    process.exit(1);
  }
};

seedPlans();




