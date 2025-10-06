const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Category = require("../models/Category");
const ServiceType = require("../models/ServiceType");
const User = require("../models/User");


const router = express.Router();

// Admin: Get ALL bookings with populated user info
router.get("/all", verifyToken, async (req, res) => {
  if (req.user.role !== "admin") {
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
router.get("/", verifyToken, async (req, res) => {
  try {
     console.log("Fetching bookings for user:", req.user.id); // add this
    const bookings = await Booking.find({ user: req.user.id })
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
    const { service, date, note, guestInfo } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    console.log("Booking request:", { service, date, note, guestInfo: !!guestInfo });
    console.log("Has token:", !!token);

    if (!service) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    // Fetch the service to get category and serviceType
    const serviceDoc = await Service.findById(service).populate('category type');
    if (!serviceDoc) {
      return res.status(404).json({ message: "Service not found" });
    }

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

    const bookingData = {
      user: userId,
      category: serviceDoc.category._id,
      serviceType: serviceDoc.type._id,
      service,
      date,
      note,
    };

    // Add guest information if no user ID
    if (!userId && guestInfo) {
      bookingData.guestInfo = guestInfo;
    }

    const booking = await Booking.create(bookingData);

    // Loyalty Points Logic (only for logged-in users)
    if (userId) {
      const bookingCount = await Booking.countDocuments({ user: userId });
      const points = bookingCount === 1 ? 50 : 20;

      await User.findByIdAndUpdate(userId, {
        $inc: { loyaltyPoints: points },
      });
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error("Booking failed:", err);
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
});


// Cancel booking
router.patch("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
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
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed", error: err.message });
  }
});

// Update booking
// Update booking - allow provider/admin to update status
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwner = booking.user.toString() === req.user.id || req.user.role === "provider" || req.user.role === "admin";
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
router.get("/provider/bookings", verifyToken, async (req, res) => {
  if (req.user.role !== "provider") {
    return res.status(403).json({ message: "Only providers can access this" });
  }

  try {
    // Get all services for this provider
    const providerServices = await Service.find({ provider: req.user.id }).select("_id");

    // Get bookings that match these services, populate user and service info
    const bookings = await Booking.find({ service: { $in: providerServices.map(s => s._id) } })
      .populate("user", "name email")
      .populate("service", "name price")  // populate service with these fields
      .sort("-createdAt");

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch provider bookings", error: err.message });
  }
});
router.get("/my", verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
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




