const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads')); // Serve uploaded files

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

const loyaltyRoutes = require("./routes/loyalty");
app.use("/api/loyalty", loyaltyRoutes);

const bookingRoutes = require("./routes/bookings");
app.use("/api/bookings", bookingRoutes);

const serviceRoutes = require("./routes/services");
app.use("/api/services", serviceRoutes);

const categoriesRouter = require("./routes/categories");
app.use("/api/categories", categoriesRouter);

const serviceTypeRoutes = require("./routes/serviceType");
app.use("/api/types", serviceTypeRoutes);

const providerBookingsRouter = require("./routes/providerBookings");
app.use("/api", providerBookingsRouter);

const contactRoutes = require("./routes/contact");
app.use("/api/contact", contactRoutes);

app.use("/api/payments", require("./routes/payment"));

// Subscription routes
const subscriptionRoutes = require("./routes/subscription");
app.use("/api/subscriptions", subscriptionRoutes);

const subscriptionPlanRoutes = require("./routes/subscriptionPlans");
app.use("/api/subscription-plans", subscriptionPlanRoutes);


// Root route
app.get("/", (req, res) => {
  res.send("Gezana backend is running 🚀");
});

// DB & Server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    
    // Start subscription maintenance scheduler
    const { scheduleSubscriptionMaintenance } = require("./utils/subscriptionManager");
    scheduleSubscriptionMaintenance();
    
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));


