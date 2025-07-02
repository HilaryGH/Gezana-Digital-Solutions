const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const auth = require("../middleware/auth"); // your auth middleware

// GET /provider/bookings - get bookings for services provider owns
router.get("/provider/bookings", auth, async (req, res) => {
  try {
    const providerId = req.user.id; // set by your auth middleware

    // Find bookings where the booked service belongs to the provider
    const bookings = await Booking.find()
      .populate({
        path: "service",
        match: { provider: providerId },  // only services that belong to this provider
      })
      .populate("user", "name email phone") // fetch user (seeker) info (adjust fields)
      .exec();

    // Remove bookings where service is null (not belonging to provider)
    const filteredBookings = bookings.filter((b) => b.service !== null);

    res.json(filteredBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch bookings for provider" });
  }
});

module.exports = router;
