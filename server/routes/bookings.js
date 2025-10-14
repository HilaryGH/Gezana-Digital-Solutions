const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Category = require("../models/Category");
const ServiceType = require("../models/ServiceType");
const User = require("../models/User");
const { sendBookingConfirmationNotifications } = require("../utils/notificationService");


const router = express.Router();

// Admin: Get ALL bookings with populated user info
router.get("/all", authMiddleware, async (req, res) => {
  if (!["admin", "superadmin", "support"].includes(req.user.role)) {
    return res.status(403).json({ message: "Permission denied" });
  }

  try {
   
   const bookings = await Booking.find()
  .populate("user", "name email")
  .populate({
  path: "service",
  populate: [
    { path: "provider", select: "name email" },
    { path: "category", select: "name" }, // ✅ this is required for category to show
  ],
})

  .populate("serviceType", "name")
  .populate({
    path: "service",
    populate: {
      path: "provider",
      select: "name email",
    },
  })
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
    const { service, date, note, guestInfo, paymentMethod } = req.body;
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
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    console.log("🔍 Finding/creating category:", serviceDoc.category);
    let categoryDoc = await Category.findOne({ name: serviceDoc.category });
    if (!categoryDoc) {
      console.log("📝 Creating new category:", serviceDoc.category);
      categoryDoc = await Category.create({ name: serviceDoc.category });
    }
    console.log("✅ Category:", categoryDoc.name, "ID:", categoryDoc._id);

    console.log("🔍 Finding/creating service type:", serviceDoc.type);
    let serviceTypeDoc = await ServiceType.findOne({ name: serviceDoc.type });
    if (!serviceTypeDoc) {
      console.log("📝 Creating new service type:", serviceDoc.type);
      serviceTypeDoc = await ServiceType.create({ 
        name: serviceDoc.type,
        category: categoryDoc._id 
      });
    }
    console.log("✅ Service Type:", serviceTypeDoc.name, "ID:", serviceTypeDoc._id);

    const bookingData = {
      user: userId,
      category: categoryDoc._id,
      serviceType: serviceTypeDoc._id,
      service,
      date,
      note,
    };

    // Add guest information if no user ID
    if (!userId && guestInfo) {
      bookingData.guestInfo = guestInfo;
    }

    console.log("📝 Creating booking with data:", {
      user: userId || 'guest',
      category: categoryDoc._id,
      serviceType: serviceTypeDoc._id,
      service,
      hasGuestInfo: !!bookingData.guestInfo
    });

    const booking = await Booking.create(bookingData);
    console.log("✅ Booking created successfully! ID:", booking._id);

    // Populate booking for notification
    const populatedBooking = await Booking.findById(booking._id)
      .populate('service')
      .populate('user');

    // Loyalty Points Logic (only for logged-in users)
    if (userId) {
      const bookingCount = await Booking.countDocuments({ user: userId });
      const points = bookingCount === 1 ? 50 : 20;

      await User.findByIdAndUpdate(userId, {
        $inc: { loyaltyPoints: points },
      });
    }

    // Send booking confirmation notifications
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
      
      console.log("Booking confirmation notifications sent:", notificationResults);
    } catch (notifError) {
      console.error("Error sending booking notifications:", notifError);
      // Don't fail booking if notifications fail
    }

    res.status(201).json(booking);
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

// Update booking
// Update booking - allow provider/admin to update status
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwner = booking.user.toString() === req.user.userId || req.user.role === "provider" || ["admin", "superadmin", "support"].includes(req.user.role);
    if (!isOwner) return res.status(403).json({ message: "Not authorized to update this booking" });

    // Only update provided fields
    if (req.body.service) booking.service = req.body.service;
    if (req.body.date) booking.date = req.body.date;
    if (req.body.note) booking.note = req.body.note;
    if (req.body.status) booking.status = req.body.status;

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


module.exports = router;




