const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Service = require("../models/Service");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET /provider/bookings - get bookings for services provider owns
router.get("/provider/bookings", authMiddleware, async (req, res) => {
  if (req.user.role !== "provider") {
    return res.status(403).json({ message: "Only providers can access this" });
  }
  try {
    const providerId = req.user.userId;
    console.log('Fetching bookings for provider:', providerId);

    // Get all services for this provider first
    const providerServices = await Service.find({ provider: providerId }).select("_id");
    console.log('Provider has services:', providerServices.length);

    // Get bookings that match these services, populate user and service info
    const bookings = await Booking.find({ 
      service: { $in: providerServices.map(s => s._id) } 
    })
      .populate("user", "name email phone")
      .populate("service", "name price")
      .sort("-createdAt")
      .lean(); // Convert to plain JavaScript objects

    console.log('Found bookings:', bookings.length);
    
    // Log first booking for debugging
    if (bookings.length > 0) {
      console.log('Sample booking:', JSON.stringify(bookings[0], null, 2));
    }
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    res.status(500).json({ message: "Failed to fetch bookings for provider", error: error.message });
  }
});

module.exports = router;
