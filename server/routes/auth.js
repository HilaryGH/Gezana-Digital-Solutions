const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();


// Register with file upload support
router.post("/register", upload.fields([
  { name: 'idFile', maxCount: 1 },
  { name: 'license', maxCount: 1 },
  { name: 'tradeRegistration', maxCount: 1 },
  { name: 'professionalCertificate', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'servicePhotos', maxCount: 5 },
  { name: 'video', maxCount: 1 },
  { name: 'priceList', maxCount: 1 }
]), async (req, res) => {
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
      branches,
      banks,
      businessStatus
    } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Phone validation
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData = {
      email,
      password: hashedPassword,
      role,
      phone,
    };

    // Add role-specific fields
    if (role === "seeker") {
      userData.name = fullName;
      userData.address = address;
      userData.whatsapp = whatsapp;
      userData.telegram = telegram;
      userData.seekerType = "individual";
      
      // Handle seeker file upload
      if (req.files && req.files.idFile) {
        userData.idFile = req.files.idFile[0].filename;
      }
    } else if (role === "provider") {
      userData.name = companyName || fullName;
      userData.subRole = subRole;
      userData.serviceType = serviceType;
      userData.alternativePhone = alternativePhone;
      userData.officePhone = officePhone;
      userData.whatsapp = whatsapp;
      userData.telegram = telegram;
      userData.city = city;
      userData.location = location;
      userData.tin = tin;
      
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
      
      // Handle provider file uploads
      if (req.files) {
        if (req.files.license) {
          userData.license = req.files.license[0].filename;
        }
        if (req.files.tradeRegistration) {
          userData.tradeRegistration = req.files.tradeRegistration[0].filename;
        }
        if (req.files.professionalCertificate) {
          userData.professionalCertificate = req.files.professionalCertificate[0].filename;
        }
        if (req.files.photo) {
          userData.photo = req.files.photo[0].filename;
        }
        if (req.files.servicePhotos) {
          userData.servicePhotos = req.files.servicePhotos.map(file => file.filename);
        }
        if (req.files.video) {
          userData.video = req.files.video[0].filename;
        }
        if (req.files.priceList) {
          userData.priceList = req.files.priceList[0].filename;
        }
      }
    }

    console.log("Creating user with data:", userData);
    const newUser = new User(userData);
    await newUser.save();
    console.log("User created successfully:", newUser._id);

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



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

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
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
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role seekerType");
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

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ 
    message: "Server is healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
