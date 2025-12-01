const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("./config/passport");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - allow production and development URLs
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://homehubdigital.netlify.app",
  "http://localhost:5173"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files at /uploads path

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "your-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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

const teamMembersRoutes = require("./routes/teamMembers");
app.use("/api/team-members", teamMembersRoutes);

const testimonialsRoutes = require("./routes/testimonials");
app.use("/api/testimonials", testimonialsRoutes);

const reviewsRoutes = require("./routes/reviews");
app.use("/api/reviews", reviewsRoutes);

const promotionalBannersRoutes = require("./routes/promotionalBanners");
app.use("/api/promotional-banners", promotionalBannersRoutes);

const supportRoutes = require("./routes/support");
app.use("/api/support", supportRoutes);

const diasporaRoutes = require("./routes/diaspora");
app.use("/api/diaspora", diasporaRoutes);

const jobsRoutes = require("./routes/jobs");
app.use("/api/jobs", jobsRoutes);

const jobApplicationsRoutes = require("./routes/jobApplications");
app.use("/api/job-applications", jobApplicationsRoutes);

const statisticsRoutes = require("./routes/statistics");
app.use("/api/statistics", statisticsRoutes);

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


