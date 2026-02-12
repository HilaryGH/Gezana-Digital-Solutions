const express = require("express");
const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Category = require("../models/Category");
const ServiceType = require("../models/ServiceType");
const User = require("../models/User");
const Referral = require("../models/Referral");
const { sendBookingConfirmationNotifications } = require("../utils/notificationService");
const { getDistanceBetween } = require("../utils/geolocation");
const JWT_SECRET = require("../config/jwt");


const router = express.Router();

// Admin: Get count of all bookings
router.get("/count", authMiddleware, async (req, res) => {
  if (!["admin", "superadmin", "support", "marketing"].includes(req.user.role)) {
    return res.status(403).json({ message: "Permission denied" });
  }

  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const completedBookings = await Booking.countDocuments({ status: "completed" });
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });
    
    res.json({
      total: totalBookings,
      pending: pendingBookings,
      completed: completedBookings,
      confirmed: confirmedBookings,
      cancelled: cancelledBookings,
    });
  } catch (err) {
    console.error("Error fetching booking count:", err);
    res.status(500).json({ message: "Could not fetch booking count", error: err.message });
  }
});

// Admin: Get ALL bookings with populated user info
router.get("/all", authMiddleware, async (req, res) => {
  if (!["admin", "superadmin", "support", "marketing"].includes(req.user.role)) {
    return res.status(403).json({ message: "Permission denied" });
  }

  try {
   
   const bookings = await Booking.find()
  .populate("user", "name email")
  .populate({
    path: "service",
    select: "name price photos description location", // Include price and other important fields
    populate: [
      { path: "provider", select: "name email" },
      { path: "category", select: "name" }, // ✅ this is required for category to show
    ],
  })
  .populate("serviceType", "name")
  .sort("-createdAt");


    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err); // <=== Add this line
    res.status(500).json({ message: "Could not fetch bookings", error: err.message });
  }
});


// User: Get bookings for current user
router.get("/", authMiddleware, async (req, res) => {
  try {
     console.log("Fetching bookings for user:", req.user.userId); // add this
    const bookings = await Booking.find({ user: req.user.userId })
      .populate("category", "name")
      .populate("type", "name")
      .populate("service", "name price")
      .sort("-createdAt");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch your bookings", error: err.message });
  }
});

// Create a booking (supports both logged-in users and guests)
router.post("/", async (req, res) => {
  try {
    const { service, date, note, guestInfo, paymentMethod, referralCode } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    console.log("📋 Booking request received:");
    console.log("   Service ID:", service);
    console.log("   Date:", date);
    console.log("   Note:", note);
    console.log("   Payment Method:", paymentMethod);
    console.log("   Has guest info:", !!guestInfo);
    console.log("   Has token:", !!token);

    if (!service) {
      console.log("❌ Service ID missing");
      return res.status(400).json({ message: "Service ID is required" });
    }

    if (!date) {
      console.log("❌ Date missing");
      return res.status(400).json({ message: "Booking date is required" });
    }

    // Fetch the service to get category and serviceType
    console.log("🔍 Fetching service:", service);
    const serviceDoc = await Service.findById(service).populate('provider');
    if (!serviceDoc) {
      console.log("❌ Service not found with ID:", service);
      return res.status(404).json({ message: "Service not found" });
    }
    console.log("✅ Service found:", serviceDoc.name);
    console.log("   Category:", serviceDoc.category);
    console.log("   Type:", serviceDoc.type);
    console.log("   Provider:", serviceDoc.provider?.name);

    let userId = null;
    
    // If token is provided, verify it and get user ID
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id || decoded._id;
      } catch (err) {
        console.log("Invalid token, proceeding as guest");
      }
    }

    // Validate guest information if no user ID
    if (!userId && (!guestInfo || !guestInfo.fullName || !guestInfo.email || !guestInfo.phone || !guestInfo.address)) {
      return res.status(400).json({ 
        message: "Guest information is required: fullName, email, phone, and address" 
      });
    }

    // Find or create category and serviceType
    // Ensure we have valid category and type names
    const categoryName = serviceDoc.category || 'General';
    const serviceTypeName = serviceDoc.type || 'Standard';
    
    console.log("🔍 Finding/creating category:", categoryName);
    let categoryDoc = await Category.findOne({ name: categoryName });
    if (!categoryDoc) {
      try {
        console.log("📝 Creating new category:", categoryName);
        categoryDoc = await Category.create({ name: categoryName });
        console.log("✅ Category created:", categoryDoc.name, "ID:", categoryDoc._id);
      } catch (error) {
        // If creation fails (e.g., duplicate key), try to find it again
        console.warn("⚠️  Category creation failed, trying to find again:", error.message);
        categoryDoc = await Category.findOne({ name: categoryName });
        if (!categoryDoc) {
          // Last resort: find any category or create a default one
          categoryDoc = await Category.findOne() || await Category.create({ name: 'General' });
          console.log("⚠️  Using fallback category:", categoryDoc.name);
        }
      }
    }
    console.log("✅ Category:", categoryDoc.name, "ID:", categoryDoc._id);

    console.log("🔍 Finding/creating service type:", serviceTypeName);
    let serviceTypeDoc = await ServiceType.findOne({ name: serviceTypeName });
    if (!serviceTypeDoc) {
      try {
        console.log("📝 Creating new service type:", serviceTypeName);
        serviceTypeDoc = await ServiceType.create({ 
          name: serviceTypeName,
          category: categoryDoc._id 
        });
        console.log("✅ Service Type created:", serviceTypeDoc.name, "ID:", serviceTypeDoc._id);
      } catch (error) {
        // If creation fails, try to find it again
        console.warn("⚠️  Service type creation failed, trying to find again:", error.message);
        serviceTypeDoc = await ServiceType.findOne({ name: serviceTypeName });
        if (!serviceTypeDoc) {
          // Last resort: find any service type with the same category or create a default one
          serviceTypeDoc = await ServiceType.findOne({ category: categoryDoc._id }) 
            || await ServiceType.create({ 
                name: 'Standard',
                category: categoryDoc._id 
              });
          console.log("⚠️  Using fallback service type:", serviceTypeDoc.name);
        }
      }
    }
    console.log("✅ Service Type:", serviceTypeDoc.name, "ID:", serviceTypeDoc._id);

    // Calculate distance between seeker and provider
    let distance = null;
    try {
      // Get seeker location
      let seekerLocation = null;
      if (userId) {
        // For logged-in users, get location from user profile
        const seekerUser = await User.findById(userId).select('latitude longitude coordinates');
        if (seekerUser) {
          seekerLocation = seekerUser;
        }
      } else if (guestInfo && guestInfo.latitude && guestInfo.longitude) {
        // For guests, use coordinates from guestInfo if provided
        seekerLocation = {
          latitude: parseFloat(guestInfo.latitude),
          longitude: parseFloat(guestInfo.longitude)
        };
      }

      // Get provider location from service
      const providerUser = await User.findById(serviceDoc.provider._id || serviceDoc.provider)
        .select('latitude longitude coordinates');
      
      if (seekerLocation && providerUser) {
        distance = getDistanceBetween(seekerLocation, providerUser);
        console.log("📏 Calculated distance:", distance, "km");
      } else {
        console.log("⚠️  Distance calculation skipped - missing location data");
        if (!seekerLocation) console.log("   Seeker location not available");
        if (!providerUser) console.log("   Provider location not available");
      }
    } catch (error) {
      console.error("❌ Error calculating distance:", error);
      // Continue with booking creation even if distance calculation fails
    }

    const bookingData = {
      user: userId,
      category: categoryDoc._id,
      serviceType: serviceTypeDoc._id,
      service,
      date,
      note,
      paymentMethod: paymentMethod || 'cash', // Save payment method
      paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending', // Online payments start as pending until paid
      distance: distance, // Save calculated distance
    };

    // Add guest information if no user ID
    if (!userId && guestInfo) {
      bookingData.guestInfo = guestInfo;
    }

    // Handle referral code if provided
    if (referralCode) {
      const referrerUser = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (referrerUser) {
        bookingData.referralCode = referralCode.trim().toUpperCase();
        console.log(`✅ Referral code ${referralCode} found. Referrer: ${referrerUser.name} (${referrerUser._id})`);
      } else {
        console.log(`⚠️  Invalid referral code: ${referralCode}`);
        // Don't fail booking if referral code is invalid, just log it
      }
    }

    console.log("📝 Creating booking with data:", {
      user: userId || 'guest',
      category: categoryDoc._id,
      serviceType: serviceTypeDoc._id,
      service,
      distance: distance ? `${distance} km` : 'N/A',
      hasGuestInfo: !!bookingData.guestInfo
    });

    const booking = await Booking.create(bookingData);
    console.log("✅ Booking created successfully! ID:", booking._id);

    // Populate booking for response and notification
    const populatedBooking = await Booking.findById(booking._id)
      .populate('service')
      .populate('user', 'name email phone address');

    // Loyalty Points Logic (only for logged-in users)
    if (userId) {
      const bookingCount = await Booking.countDocuments({ user: userId });
      const points = bookingCount === 1 ? 50 : 20;

      await User.findByIdAndUpdate(userId, {
        $inc: { loyaltyPoints: points },
      });
    }

    // Handle referral tracking if referral code was used
    if (referralCode && bookingData.referralCode) {
      try {
        const referrerUser = await User.findOne({ referralCode: bookingData.referralCode });
        if (referrerUser) {
          // Check if referral already exists for this user and booking
          let referral = await Referral.findOne({
            referrer: referrerUser._id,
            bookingId: booking._id
          });

          if (!referral) {
            // Create new referral record
            referral = new Referral({
              referrer: referrerUser._id,
              referredUser: userId || null, // null for guest bookings
              referralCode: bookingData.referralCode,
              usedInPurchase: true,
              bookingId: booking._id,
              status: "completed"
            });
            await referral.save();

            // Update referrer's referral count
            await User.findByIdAndUpdate(referrerUser._id, {
              $inc: { referralCount: 1 }
            });

            console.log(`✅ Referral tracked for booking: ${referrerUser.name} referred this purchase`);
          }
        }
      } catch (error) {
        console.error("Error tracking referral for booking:", error);
        // Don't fail booking if referral tracking fails
      }
    }

    // Return populated booking with user info, guestInfo, and distance immediately
    // Send response first to prevent timeout, then send notifications in background
    const responseData = populatedBooking.toObject();
    responseData.distance = booking.distance; // Include distance in response
    
    res.status(201).json({
      ...responseData,
      distance: booking.distance, // Distance in kilometers
      distanceUnit: 'km'
    });

    // Send booking confirmation notifications asynchronously (non-blocking)
    // This prevents timeout issues in production where external APIs (Twilio, email) may be slow
    setImmediate(async () => {
      try {
        const customerInfo = userId ? {
          name: populatedBooking.user?.name,
          email: populatedBooking.user?.email,
          phone: populatedBooking.user?.phone,
          whatsapp: populatedBooking.user?.whatsapp
        } : {
          name: guestInfo.fullName,
          email: guestInfo.email,
          phone: guestInfo.phone,
          whatsapp: guestInfo.phone // Use phone as whatsapp for guests
        };

        const bookingDetails = {
          serviceName: serviceDoc.name,
          providerName: serviceDoc.provider?.name || 'Provider',
          date: new Date(date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          time: new Date(date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: serviceDoc.price,
          location: serviceDoc.location || 'To be determined'
        };

        const notificationResults = await sendBookingConfirmationNotifications(
          customerInfo,
          bookingDetails
        );
        
        console.log("✅ Booking confirmation notifications sent:", notificationResults);
      } catch (notifError) {
        console.error("❌ Error sending booking notifications:", notifError);
        // Don't fail booking if notifications fail - booking is already created
      }
    });
  } catch (err) {
    console.error("❌ Booking failed:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      message: "Booking failed", 
      error: err.message,
      details: err.name 
    });
  }
});


// Cancel booking
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Cancellation failed" });
  }
});

// Delete booking
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed", error: err.message });
  }
});

// Update booking payment status (for payment completion)
router.patch("/:id/payment", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Update payment status and method
    if (req.body.paymentStatus) booking.paymentStatus = req.body.paymentStatus;
    if (req.body.paymentMethod) booking.paymentMethod = req.body.paymentMethod;

    const updated = await booking.save();
    console.log("✅ Booking payment status updated:", updated._id, "Status:", updated.paymentStatus);
    res.json(updated);
  } catch (err) {
    console.error("Booking payment update failed:", err);
    res.status(500).json({ message: "Payment update failed", error: err.message });
  }
});

// Update booking
// Update booking - allow provider/admin to update status
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwner = booking.user && booking.user.toString() === req.user.userId || req.user.role === "provider" || ["admin", "superadmin", "support"].includes(req.user.role);
    if (!isOwner && booking.user) return res.status(403).json({ message: "Not authorized to update this booking" });

    // Only update provided fields
    if (req.body.service) booking.service = req.body.service;
    if (req.body.date) booking.date = req.body.date;
    if (req.body.note) booking.note = req.body.note;
    if (req.body.status) booking.status = req.body.status;
    if (req.body.paymentStatus) booking.paymentStatus = req.body.paymentStatus;
    if (req.body.paymentMethod) booking.paymentMethod = req.body.paymentMethod;

    const updated = await booking.save();
    res.json(updated);
  } catch (err) {
    console.error("Booking update failed:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});


// Provider: Get bookings for services owned by them
router.get("/provider/bookings", authMiddleware, async (req, res) => {
  if (req.user.role !== "provider") {
    return res.status(403).json({ message: "Only providers can access this" });
  }

  try {
    // Get all services for this provider
    const providerServices = await Service.find({ provider: req.user.userId }).select("_id");

    // Get bookings that match these services, populate user and service info
    const bookings = await Booking.find({ service: { $in: providerServices.map(s => s._id) } })
      .populate("user", "name email phone")
      .populate("service", "name price photos")  // populate service with these fields including photos
      .sort("-createdAt");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch provider bookings", error: err.message });
  }
});
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
        .populate({
    path: "service",
    select: "name price provider",
    populate: { path: "provider", select: "name email phone" }
  })
  .populate("user", "name email"); // Optional, you may skip if it's the same user

    res.json(bookings);
  } catch (err) {
    console.error("Failed to fetch user's bookings", err);
    res.status(500).json({ message: "Failed to fetch your bookings" });
  }
});


// Utility endpoint to restore missing categories from services
router.post("/restore-categories", async (req, res) => {
  try {
    console.log("🔄 Starting category restoration...");
    
    // Get all services
    const services = await Service.find({});
    console.log(`📋 Found ${services.length} services`);
    
    const categoriesCreated = [];
    const serviceTypesCreated = [];
    
    for (const service of services) {
      const categoryName = service.category || 'General';
      const serviceTypeName = service.type || 'Standard';
      
      // Find or create category
      let categoryDoc = await Category.findOne({ name: categoryName });
      if (!categoryDoc) {
        try {
          categoryDoc = await Category.create({ name: categoryName });
          categoriesCreated.push(categoryName);
          console.log(`✅ Created category: ${categoryName}`);
        } catch (error) {
          console.warn(`⚠️  Failed to create category ${categoryName}:`, error.message);
          categoryDoc = await Category.findOne({ name: categoryName });
        }
      }
      
      // Find or create service type
      if (categoryDoc) {
        let serviceTypeDoc = await ServiceType.findOne({ name: serviceTypeName });
        if (!serviceTypeDoc) {
          try {
            serviceTypeDoc = await ServiceType.create({ 
              name: serviceTypeName,
              category: categoryDoc._id 
            });
            serviceTypesCreated.push(serviceTypeName);
            console.log(`✅ Created service type: ${serviceTypeName} for category: ${categoryName}`);
          } catch (error) {
            console.warn(`⚠️  Failed to create service type ${serviceTypeName}:`, error.message);
          }
        }
      }
    }
    
    res.json({
      message: "Category restoration completed",
      servicesProcessed: services.length,
      categoriesCreated: categoriesCreated.length,
      serviceTypesCreated: serviceTypesCreated.length,
      newCategories: categoriesCreated,
      newServiceTypes: serviceTypesCreated
    });
  } catch (err) {
    console.error("❌ Category restoration failed:", err);
    res.status(500).json({ 
      message: "Category restoration failed", 
      error: err.message 
    });
  }
});

module.exports = router;




