// Load environment variables FIRST before using them
const dotenv = require("dotenv");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
  // Load .env file from server directory for local/dev only
  const envPath = path.join(__dirname, '.env');
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.warn("⚠️  Warning: .env file not found or error loading it:", result.error.message);
    console.log("📁 Looking for .env at:", envPath);
  } else {
    console.log("✅ Environment variables loaded from .env file");
    // Log that MONGO_URI is loaded (without showing the actual value)
    if (process.env.MONGO_URI) {
      const mongoURIPreview = process.env.MONGO_URI.includes('@')
        ? process.env.MONGO_URI.split('@')[1]
        : process.env.MONGO_URI;
      console.log("📦 MONGO_URI loaded:", mongoURIPreview.substring(0, 50) + "...");
    }
  }
} else {
  console.log("✅ Production mode detected: using platform environment variables");
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");
const { sendDebugEmail, getEnvDebugInfo } = require("./utils/emailService");

// Initialize Cloudinary if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  require("./config/cloudinary");
  console.log("✅ Cloudinary initialized");
} else {
  console.log("⚠️  Cloudinary not configured - using local file storage");
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - important for proper X-Forwarded-* header handling (critical for mobile)
// This allows Express to correctly detect protocol and host when behind a proxy
app.set('trust proxy', true);

// Middleware — production frontends (comma-separated CLIENT_URL supported)
const allowedOrigins = [
  ...new Set(
    [
      "https://homehub.et",
      "https://www.homehub.et",
      "https://homehubdigital.netlify.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      ...(process.env.CLIENT_URL || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ].filter(Boolean)
  ),
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin); // echo origin
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // critical for cookies/sessions
  }

  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});
 
app.use(express.json());

// Serve uploaded files at /uploads path (use absolute path for reliability)
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
  // Handle CORS preflight requests (critical for mobile)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
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
    // Set comprehensive CORS headers for images (critical for mobile)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    // Ensure proper content type
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
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
// Also mount at /auth for OAuth callbacks
app.use("/auth", authRoutes);

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

const loyaltyRoutes = require("./routes/loyalty");
app.use("/api/loyalty", loyaltyRoutes);

const bookingRoutes = require("./routes/bookings");
app.use("/api/bookings", bookingRoutes);

const serviceRoutes = require("./routes/services");
app.use("/api/services", serviceRoutes);

const catalogRoutes = require("./routes/catalog");
app.use("/api/catalog", catalogRoutes);

const categoriesRouter = require("./routes/categories");
app.use("/api/categories", categoriesRouter);

const serviceTypeRoutes = require("./routes/serviceType");
app.use("/api/types", serviceTypeRoutes);

const providerBookingsRouter = require("./routes/providerBookings");
app.use("/api", providerBookingsRouter);

const providerRoutes = require("./routes/provider");
app.use("/api/provider", providerRoutes);

const contactRoutes = require("./routes/contact");
app.use("/api/contact", contactRoutes);

const agentsRoutes = require("./routes/agents");
app.use("/api/agents", agentsRoutes);

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

const womenInitiativesRoutes = require("./routes/womenInitiatives");
app.use("/api/women-initiatives", womenInitiativesRoutes);

const premiumMembershipsRoutes = require("./routes/premiumMemberships");
app.use("/api/premium-memberships", premiumMembershipsRoutes);

const specialOffersRoutes = require("./routes/specialOffers");
app.use("/api/special-offers", specialOffersRoutes);

const statisticsRoutes = require("./routes/statistics");
app.use("/api/statistics", statisticsRoutes);

const referralsRoutes = require("./routes/referrals");
app.use("/api/referrals", referralsRoutes);

const serviceRequestsRoutes = require("./routes/serviceRequests");
app.use("/api/service-requests", serviceRequestsRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Gezana backend is running 🚀",
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
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

// Debug email endpoint for API-based delivery (Resend over HTTPS)
app.get(["/debug-email", "/api/debug-email"], async (req, res) => {
  try {
    const to = String(req.query.to || process.env.DEBUG_EMAIL_TO || "").trim();
    const debugResult = await sendDebugEmail(to);
    const statusCode = debugResult.success ? 200 : 500;

    return res.status(statusCode).json({
      ok: debugResult.success,
      message: debugResult.success
        ? "Debug email sent successfully"
        : "Debug email failed",
      target: to || null,
      diagnostics: debugResult,
      env: getEnvDebugInfo(),
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Debug endpoint failed unexpectedly",
      error: error && error.message ? error.message : "Unknown error",
      env: getEnvDebugInfo(),
    });
  }
});

// DB & Server
// Check if MONGO_URI is set
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI is not set in environment variables!");
  console.error("📝 Set MONGO_URI in server/.env to your MongoDB Atlas connection string, e.g.:");
  console.error("   MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/DATABASE");
  process.exit(1);
}

console.log("🔌 Attempting to connect to MongoDB (MONGO_URI only — no local fallback)...");
console.log("📍 Connection string:", mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')); // Hide password in logs

mongoose
  .connect(mongoURI, {
    // Connection options for better reliability
    serverSelectionTimeoutMS: 10000, // Timeout after 10s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    connectTimeoutMS: 10000, // Give up initial connection after 10s
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 5, // Maintain at least 5 socket connections
    // For MongoDB Atlas, these options help with connection stability
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
    console.log("🌐 Host:", mongoose.connection.host);

    // Start subscription maintenance scheduler
    const { scheduleSubscriptionMaintenance } = require("./utils/subscriptionManager");
    scheduleSubscriptionMaintenance();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API available at: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("\n💡 Atlas troubleshooting (MONGO_URI must reach the cloud cluster):");
    console.error("   1. Atlas → Network Access: add your current public IP (or 0.0.0.0/0 for testing only)");
    console.error("   2. Atlas → Database Access: user/password must match MONGO_URI");
    console.error("   3. Connection string: use mongodb+srv://... from Atlas “Connect” (correct cluster host)");
    console.error("   4. If password has special characters, URL-encode it in MONGO_URI");
    console.error("   5. Corporate/VPN/firewall may block outbound 27017 — try another network");
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message || err);
});


