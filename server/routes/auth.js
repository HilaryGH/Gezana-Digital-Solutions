const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const crypto = require("crypto");
const User = require("../models/User");
const Referral = require("../models/Referral");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const {
  sendWelcomeNotifications,
  sendRegistrationInternalAlert,
} = require("../utils/notificationService");
const { sendPasswordResetEmail, sendWelcomeEmailWithReferral } = require("../utils/emailService");
const JWT_SECRET = require("../config/jwt");

// Generate unique referral code
const generateReferralCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing characters
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const existing = await User.findOne({ referralCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
};

const router = express.Router();

const REGISTER_ROLES = [
  "seeker",
  "provider",
  "agent",
  "admin",
  "superadmin",
  "support",
  "marketing",
];

const REGISTER_UPLOAD_FIELDS = [
  { name: "idFile", maxCount: 1 },
  { name: "license", maxCount: 1 },
  { name: "tradeRegistration", maxCount: 1 },
  { name: "tinDocument", maxCount: 1 },
  { name: "professionalCertificate", maxCount: 1 },
  { name: "governmentId", maxCount: 1 },
  { name: "crCertificate", maxCount: 1 },
  { name: "photo", maxCount: 1 },
  { name: "servicePhotos", maxCount: 5 },
  { name: "video", maxCount: 1 },
  { name: "priceList", maxCount: 1 },
  { name: "bbDocuments", maxCount: 1 },
  { name: "guarantorIdAttachment", maxCount: 1 },
  { name: "guarantorPhoto", maxCount: 1 },
  { name: "agentIdDocument", maxCount: 1 },
  { name: "agentWorkExperience", maxCount: 1 },
  { name: "agentPhoto", maxCount: 1 },
  { name: "corporateBusinessRegistration", maxCount: 1 },
  { name: "corporateBusinessLicense", maxCount: 1 },
  { name: "corporateAchievementsCertificate", maxCount: 1 },
  { name: "corporateTin", maxCount: 1 },
];

const registerUpload = upload.fields(REGISTER_UPLOAD_FIELDS);

function normalizePhoneInput(phone) {
  if (phone == null) return undefined;
  const t = String(phone).trim();
  if (!t) return undefined;
  return t.replace(/[\s\-().\u00A0]/g, "");
}

function isValidE164ishPhone(s) {
  if (!s) return true;
  const core = s.startsWith("+") ? s.slice(1) : s;
  return /^\d{7,15}$/.test(core);
}

// Register with file upload support (multipart). Files are optional for all roles.
router.post(
  "/register",
  (req, res, next) => {
    registerUpload(req, res, (err) => {
      if (err) {
        console.error("Register multipart error:", err);
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              message: "One or more files exceed the maximum size (12 MB per file).",
            });
          }
          if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ message: "Too many or unexpected files in upload." });
          }
          return res.status(400).json({ message: err.message || "File upload error" });
        }
        return res.status(400).json({ message: err.message || "File upload rejected" });
      }
      next();
    });
  },
  async (req, res) => {
  try {
    console.log("Registration request received");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const {
      fullName,
      companyName,
      email,
      password,
      confirmPassword,
      role,
      subRole,
      serviceCategory,
      freelanceSubCategory,
      phone,
      alternativePhone,
      officePhone,
      whatsapp,
      telegram,
      address,
      city,
      location,
      tin,
      serviceType,
      gender,
      femaleLedOrOwned,
      workExperience,
      guarantorFullName,
      guarantorPhone,
      guarantorCity,
      guarantorPrimaryLocation,
      // Agent fields
      agentType,
      agentTin,
      cityOfResidence,
      primaryLocation,
      branches,
      banks,
      businessStatus,
      referralCode // Referral code used during registration
    } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!role || !REGISTER_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid or missing registration role." });
    }

    const phoneNorm = normalizePhoneInput(phone);
    const altPhoneNorm = normalizePhoneInput(alternativePhone);
    const officePhoneNorm = normalizePhoneInput(officePhone);
    const guarantorPhoneNorm = normalizePhoneInput(req.body.guarantorPhone);

    if (!isValidE164ishPhone(phoneNorm)) {
      return res.status(400).json({
        message:
          "Invalid phone number. Use 7–15 digits; you may include a leading + (spaces and dashes are OK).",
      });
    }
    if (alternativePhone && !isValidE164ishPhone(altPhoneNorm)) {
      return res.status(400).json({ message: "Invalid alternative phone format." });
    }
    if (officePhone && !isValidE164ishPhone(officePhoneNorm)) {
      return res.status(400).json({ message: "Invalid office phone format." });
    }
    if (req.body.guarantorPhone && !isValidE164ishPhone(guarantorPhoneNorm)) {
      return res.status(400).json({ message: "Invalid guarantor phone format." });
    }

    if (role === "seeker") {
      if (!fullName || !String(fullName).trim()) {
        return res.status(400).json({ message: "Full name is required." });
      }
      if (!phoneNorm) {
        return res.status(400).json({ message: "Phone is required." });
      }
    }

    if (role === "provider") {
      if (!subRole || !["freelancer", "smallBusiness", "specializedBusiness"].includes(subRole)) {
        return res.status(400).json({ message: "Please select a valid provider type." });
      }
      const displayName = String(companyName || fullName || "").trim();
      if (!displayName) {
        return res.status(400).json({ message: "Name or company name is required." });
      }
      if (!serviceType || !String(serviceType).trim()) {
        return res.status(400).json({ message: "Service type is required." });
      }
      if (!phoneNorm) {
        return res.status(400).json({ message: "Phone is required." });
      }
      if (subRole === "freelancer" && (!gender || !["male", "female"].includes(gender))) {
        return res.status(400).json({ message: "Gender is required for freelancers." });
      }
      if (
        (subRole === "smallBusiness" || subRole === "specializedBusiness") &&
        (!femaleLedOrOwned ||
          !["female-led", "female-owned", "non-female"].includes(femaleLedOrOwned))
      ) {
        return res.status(400).json({ message: "Business type is required." });
      }
      const workExpAllowed = [
        "1 year",
        "1+ year to 3 years",
        "3+ year to 5 years",
        "5+ years",
      ];
      if (!workExperience || !workExpAllowed.includes(workExperience)) {
        return res.status(400).json({ message: "Work experience is required." });
      }
    }

    if (role === "agent") {
      if (!agentType || !["individual", "corporate"].includes(agentType)) {
        return res.status(400).json({ message: "Agent type must be individual or corporate." });
      }
      if (!primaryLocation || !String(primaryLocation).trim()) {
        return res.status(400).json({ message: "Primary location is required." });
      }
      if (!phoneNorm) {
        return res.status(400).json({ message: "Phone is required." });
      }
      if (agentType === "individual") {
        if (!fullName || !String(fullName).trim()) {
          return res.status(400).json({ message: "Full name is required." });
        }
        if (!cityOfResidence || !String(cityOfResidence).trim()) {
          return res.status(400).json({ message: "City of residence is required." });
        }
      } else {
        if (!companyName || !String(companyName).trim()) {
          return res.status(400).json({ message: "Company name is required." });
        }
        if (!city || !String(city).trim()) {
          return res.status(400).json({ message: "City is required." });
        }
      }
    }

    if (["superadmin", "support", "marketing"].includes(role) && !phoneNorm) {
      return res.status(400).json({ message: "Phone is required for this role." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { getFileUrl } = require("../utils/fileHelper");

    // Prepare user data
    const userData = {
      email,
      password: hashedPassword,
      role,
      phone: phoneNorm,
    };

    // Handle referral code if provided
    let referrerUser = null;
    if (referralCode) {
      referrerUser = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (referrerUser) {
        userData.referredBy = referrerUser._id;
        console.log(`✅ Referral code ${referralCode} found. Referrer: ${referrerUser.name} (${referrerUser._id})`);
      } else {
        console.log(`⚠️  Invalid referral code: ${referralCode}`);
        // Don't fail registration if referral code is invalid, just log it
      }
    }

    // Add role-specific fields
    if (role === "seeker") {
      userData.name = fullName;
      userData.address = address;
      userData.whatsapp = whatsapp;
      userData.telegram = telegram;
      userData.seekerType = "individual";

      // Generate referral code for individual seekers
      if (userData.seekerType === "individual") {
        userData.referralCode = await generateReferralCode();
        console.log(`✅ Generated referral code for new individual seeker: ${userData.referralCode}`);
      }

      // Handle seeker file upload (optional)
      if (req.files && req.files.idFile) {
        userData.idFile = getFileUrl(req.files.idFile[0]);
      }
    } else if (role === "provider") {
      userData.name = companyName || fullName;
      userData.subRole = subRole;
      userData.serviceType = serviceType;
      if (serviceCategory) {
        userData.serviceCategory = serviceCategory;
      }
      if (freelanceSubCategory) {
        userData.freelanceSubCategory = freelanceSubCategory;
      }
      userData.alternativePhone = altPhoneNorm;
      userData.officePhone = officePhoneNorm;
      userData.whatsapp = whatsapp;
      userData.telegram = telegram;
      userData.city = city;
      userData.location = location;
      userData.tin = tin;
      // Add gender for freelancers
      if (gender) {
        userData.gender = gender;
      }
      // Add female-led/owned for small business and specialized business
      if (femaleLedOrOwned) {
        userData.femaleLedOrOwned = femaleLedOrOwned;
      }
      // Add work experience for all service providers
      if (workExperience) {
        userData.workExperience = workExperience;
      }

      // Parse JSON fields
      if (branches) {
        try {
          userData.branches = JSON.parse(branches);
        } catch (e) {
          userData.branches = [];
        }
      }

      if (banks) {
        try {
          userData.banks = JSON.parse(banks);
        } catch (e) {
          userData.banks = [];
        }
      }

      if (businessStatus) {
        try {
          userData.businessStatus = JSON.parse(businessStatus);
        } catch (e) {
          userData.businessStatus = [];
        }
      }

      // Handle provider file uploads (all optional)
      if (req.files) {
        if (req.files.license) {
          userData.license = getFileUrl(req.files.license[0]);
        }
        if (req.files.tradeRegistration) {
          userData.tradeRegistration = getFileUrl(req.files.tradeRegistration[0]);
        }
        if (req.files.tinDocument) {
          userData.tinDocument = getFileUrl(req.files.tinDocument[0]);
        }
        if (req.files.professionalCertificate) {
          userData.professionalCertificate = getFileUrl(req.files.professionalCertificate[0]);
        }
        if (req.files.governmentId) {
          userData.governmentId = getFileUrl(req.files.governmentId[0]);
        }
        if (req.files.crCertificate) {
          userData.crCertificate = getFileUrl(req.files.crCertificate[0]);
        }
        if (req.files.photo) {
          userData.photo = getFileUrl(req.files.photo[0]);
        }
        if (req.files.servicePhotos) {
          userData.servicePhotos = req.files.servicePhotos.map(file => getFileUrl(file));
        }
        if (req.files.video) {
          userData.video = getFileUrl(req.files.video[0]);
        }
        if (req.files.priceList) {
          userData.priceList = getFileUrl(req.files.priceList[0]);
        }
        if (req.files.bbDocuments) {
          userData.bbDocuments = getFileUrl(req.files.bbDocuments[0]);
        }
        if (req.files.guarantorIdAttachment) {
          userData.guarantorIdAttachment = getFileUrl(req.files.guarantorIdAttachment[0]);
        }
        if (req.files.guarantorPhoto) {
          userData.guarantorPhoto = getFileUrl(req.files.guarantorPhoto[0]);
        }
      }

      if (guarantorFullName) {
        userData.guarantorFullName = guarantorFullName;
      }
      if (guarantorPhone) {
        userData.guarantorPhone = guarantorPhoneNorm || guarantorPhone;
      }
      if (guarantorCity) {
        userData.guarantorCity = guarantorCity;
      }
      if (guarantorPrimaryLocation) {
        userData.guarantorPrimaryLocation = guarantorPrimaryLocation;
      }
    } else if (role === "agent") {
      // Agent registration (individual or corporate)
      userData.agentType = agentType;
      userData.agentEnabled = true; // auto-enable agents
      userData.whatsapp = whatsapp;
      userData.telegram = telegram;
      userData.primaryLocation = primaryLocation;
      if (agentTin) userData.agentTin = agentTin;
      // Generate referral code for agents so they can share it
      userData.referralCode = await generateReferralCode();

      if (agentType === "corporate") {
        userData.name = companyName; // display name
        userData.companyName = companyName;
        userData.city = city; // corporate city
      } else {
        userData.name = fullName;
        userData.cityOfResidence = cityOfResidence;
        userData.city = cityOfResidence;
      }

      // Handle agent file uploads (all optional)
      if (req.files) {
        if (req.files.agentIdDocument) {
          userData.agentIdDocument = getFileUrl(req.files.agentIdDocument[0]);
        }
        if (req.files.agentWorkExperience) {
          userData.agentWorkExperience = getFileUrl(req.files.agentWorkExperience[0]);
        }
        if (req.files.agentPhoto) {
          userData.agentPhoto = getFileUrl(req.files.agentPhoto[0]);
        }
        if (req.files.corporateBusinessRegistration) {
          userData.corporateBusinessRegistration = getFileUrl(req.files.corporateBusinessRegistration[0]);
        }
        if (req.files.corporateBusinessLicense) {
          userData.corporateBusinessLicense = getFileUrl(req.files.corporateBusinessLicense[0]);
        }
        if (req.files.corporateAchievementsCertificate) {
          userData.corporateAchievementsCertificate = getFileUrl(req.files.corporateAchievementsCertificate[0]);
        }
        if (req.files.corporateTin) {
          userData.corporateTin = getFileUrl(req.files.corporateTin[0]);
        }
      }
    } else if (role === "admin") {
      // Admin registration
      userData.name = fullName || "Admin User";
      userData.isVerified = true; // Auto-verify admin accounts
    } else if (role === "superadmin") {
      // Super Admin registration
      userData.name = fullName || "Super Admin";
      userData.isVerified = true; // Auto-verify super admin accounts
      userData.phone = phoneNorm;
    } else if (role === "support") {
      // Customer Support registration
      userData.name = fullName || "Support User";
      userData.isVerified = true; // Auto-verify support accounts
      userData.phone = phoneNorm;
    } else if (role === "marketing") {
      userData.name = fullName || "Marketing User";
      userData.isVerified = true;
      userData.phone = phoneNorm;
    }

    console.log("Creating user with data:", userData);
    const newUser = new User(userData);
    await newUser.save();
    console.log("User created successfully:", newUser._id);

    // Handle referral tracking if user was referred
    if (referrerUser && newUser.referredBy) {
      try {
        const referral = new Referral({
          referrer: referrerUser._id,
          referredUser: newUser._id,
          referralCode: referralCode.trim().toUpperCase(),
          usedInRegistration: true,
          status: "completed"
        });
        await referral.save();
        
        // Update referrer's referral count
        await User.findByIdAndUpdate(referrerUser._id, {
          $inc: { referralCount: 1 }
        });
        
        console.log(`✅ Referral tracked: ${referrerUser.name} referred ${newUser.name}`);
      } catch (error) {
        console.error("Error tracking referral:", error);
        // Don't fail registration if referral tracking fails
      }
    }

    // Respond immediately so slow external services (email/WhatsApp) don't break registration.
    // The welcome notifications are intentionally "fire-and-forget".
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

    // Send welcome notifications (Email + WhatsApp) - skip for admin/superadmin/support users
    if (!["admin", "superadmin", "support", "marketing"].includes(role)) {
      void (async () => {
        try {
          // For individual seekers, send email with referral code
          if (role === "seeker" && newUser.seekerType === "individual" && newUser.referralCode) {
            await sendWelcomeEmailWithReferral(newUser.email, newUser.name, newUser.referralCode);
          } else {
            // For other users, send regular welcome notifications
            const notificationResults = await sendWelcomeNotifications({
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              phone: newUser.phone,
              whatsapp: newUser.whatsapp
            });
            console.log("Welcome notifications sent:", notificationResults);
          }
        } catch (notifError) {
          console.error("Error sending welcome notifications:", notifError);
          // Don't fail registration if notifications fail
        }
      })();
    } else {
      console.log("Skipping welcome notifications for admin/superadmin/support/marketing user");
    }

    // Internal alert for every successful registration (fire-and-forget)
    void (async () => {
      try {
        await sendRegistrationInternalAlert({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
        });
      } catch (alertError) {
        console.error("Error sending internal registration alert:", alertError);
      }
    })();

    return;
  } catch (err) {
    console.error("Registration error:", err);
    if (err.name === "ValidationError") {
      const first =
        err.errors && Object.keys(err.errors).length
          ? err.errors[Object.keys(err.errors)[0]].message
          : "Validation failed";
      return res.status(400).json({ message: first });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const isProd = process.env.NODE_ENV === "production";
    res.status(500).json({
      message: isProd
        ? "Registration could not be completed. Please try again or contact support."
        : err.message || "Server error",
    });
  }
  }
);



// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// GET /api/user/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email role seekerType");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      seekerType: user.seekerType, // ✅ Needed for dashboard selection
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update user language preference
router.put("/language", authMiddleware, async (req, res) => {
  try {
    const { language } = req.body;

    if (!language || !["en", "am"].includes(language)) {
      return res.status(400).json({
        message: "Invalid language. Must be 'en' or 'am'"
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.language = language;
    await user.save();

    res.json({
      message: "Language preference updated successfully",
      language: user.language
    });
  } catch (err) {
    console.error("Language update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Social Authentication Routes

// Google OAuth routes
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

router.get("/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      const user = req.user;

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Redirect to frontend with token
      // Use production URL in production, otherwise use localhost
      const clientUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.CLIENT_URL || "https://homehubdigital.netlify.app")
        : (process.env.CLIENT_URL || "http://localhost:5173");
      const redirectUrl = `${clientUrl}/auth/success?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      const clientUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.CLIENT_URL || "https://homehubdigital.netlify.app")
        : (process.env.CLIENT_URL || "http://localhost:5173");
      const errorUrl = `${clientUrl}/auth/error?message=${encodeURIComponent("Authentication failed")}`;
      res.redirect(errorUrl);
    }
  }
);

// Facebook OAuth routes
router.get("/facebook", passport.authenticate("facebook", {
  scope: ["email"]
}));

router.get("/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    try {
      const user = req.user;

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Redirect to frontend with token
      // Use production URL in production, otherwise use localhost
      const clientUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.CLIENT_URL || "https://homehubdigital.netlify.app")
        : (process.env.CLIENT_URL || "http://localhost:5173");
      const redirectUrl = `${clientUrl}/auth/success?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Facebook OAuth callback error:", error);
      const clientUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.CLIENT_URL || "https://homehubdigital.netlify.app")
        : (process.env.CLIENT_URL || "http://localhost:5173");
      const errorUrl = `${clientUrl}/auth/error?message=${encodeURIComponent("Authentication failed")}`;
      res.redirect(errorUrl);
    }
  }
);

// Forgot Password - Send reset email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    
    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return res.json({
        message: "If an account with that email exists, we've sent a password reset link."
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Set token and expiration (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
      console.log("Password reset email sent to:", user.email);
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: "If an account with that email exists, we've sent a password reset link."
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Reset Password - Verify token and update password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token. Please request a new password reset." 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      message: "Password has been reset successfully. You can now login with your new password."
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
