// Load environment variables FIRST before using them
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");

// Initialize Cloudinary if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  require("./config/cloudinary");
  console.log("✅ Cloudinary initialized");
} else {
  console.log("⚠️  Cloudinary not configured - using local file storage");
}

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

// Serve uploaded files at /uploads path (use absolute path for reliability)
const path = require("path");
const fs = require("fs");
const uploadsPath = path.join(__dirname, 'uploads');

// Ensure uploads directory exists (important for production)
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsPath);
} else {
  console.log('✅ Uploads directory exists:', uploadsPath);
}

// Serve uploaded files at /uploads path (before API routes)
app.use('/uploads', (req, res, next) => {
  // Log file requests in production for debugging
  if (process.env.NODE_ENV === 'production') {
    const filePath = path.join(uploadsPath, req.path);
    const exists = fs.existsSync(filePath);
    if (!exists) {
      console.warn('⚠️  Production: File not found:', req.path);
    }
  }
  next();
}, express.static(uploadsPath, {
  // Set proper headers for file serving
  setHeaders: (res, filePath) => {
    // Set cache headers for images
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || 
        filePath.endsWith('.png') || filePath.endsWith('.gif') || 
        filePath.endsWith('.webp') || filePath.endsWith('.jfif')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    }
    // Set CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
  },
  // Allow fallthrough to handle 404s
  fallthrough: true
}));

// Handle 404 for missing upload files (after static middleware)
app.use('/uploads', (req, res) => {
  console.warn('⚠️  404 - File not found:', req.path);
  res.status(404).json({ 
    error: 'File not found',
    message: 'The requested file does not exist on the server. Note: Files uploaded in development may not exist in production.',
    path: req.path,
    suggestion: 'Please re-upload the file in production or configure Cloudinary for persistent storage.'
  });
});

console.log('📁 Static file serving configured for:', uploadsPath);
console.log('📁 Uploads directory contents:', fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath).length + ' files' : 'empty');

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

const investmentsRoutes = require("./routes/investments");
app.use("/api/investments", investmentsRoutes);

const premiumMembershipsRoutes = require("./routes/premiumMemberships");
app.use("/api/premium-memberships", premiumMembershipsRoutes);

const statisticsRoutes = require("./routes/statistics");
app.use("/api/statistics", statisticsRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Gezana backend is running 🚀");
});

// Diagnostic route to check uploads directory
app.get("/api/health/uploads", (req, res) => {
  const uploadsExist = fs.existsSync(uploadsPath);
  const files = uploadsExist ? fs.readdirSync(uploadsPath) : [];
  const fileCount = files.length;
  
  res.json({
    uploadsPath,
    exists: uploadsExist,
    fileCount,
    files: files.slice(0, 10), // Show first 10 files
    environment: process.env.NODE_ENV || 'development',
    cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  });
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


