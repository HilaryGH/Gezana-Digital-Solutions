const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

// GET /api/statistics/navbar - Get statistics for navbar display
router.get("/navbar", async (req, res) => {
  try {
    // Calculate date for "this week" (7 days ago)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Count new providers who joined this week
    const newProvidersThisWeek = await User.countDocuments({
      role: "provider",
      createdAt: { $gte: oneWeekAgo }
    });

    // Count completed bookings
    const completedBookings = await Booking.countDocuments({
      status: "completed"
    });

    // Calculate average rating from reviews
    const reviews = await Review.find({});
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    res.json({
      newProvidersThisWeek,
      completedBookings,
      averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
    });
  } catch (error) {
    console.error("Error fetching navbar statistics:", error);
    res.status(500).json({ 
      message: "Failed to fetch statistics",
      error: error.message 
    });
  }
});

module.exports = router;

