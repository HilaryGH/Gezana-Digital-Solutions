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
    oneWeekAgo.setHours(0, 0, 0, 0); // Start of day

    // Count new providers who joined this week
    // Include all providers (active or not) for the count
    const newProvidersThisWeek = await User.countDocuments({
      role: "provider",
      createdAt: { $gte: oneWeekAgo }
    });

    // Count completed bookings (case-insensitive)
    let completedBookings = await Booking.countDocuments({
      $or: [
        { status: "completed" },
        { status: { $regex: /^completed$/i } }
      ]
    });

    // Also get total bookings count and confirmed bookings
    const totalBookings = await Booking.countDocuments({});
    const confirmedBookings = await Booking.countDocuments({
      $or: [
        { status: "confirmed" },
        { status: { $regex: /^confirmed$/i } }
      ]
    });

    // If no completed bookings, show confirmed bookings as a fallback
    // This gives a better user experience
    if (completedBookings === 0 && confirmedBookings > 0) {
      completedBookings = confirmedBookings;
    }

    // Calculate average rating from approved and active reviews
    // Get all reviews and filter in memory for better compatibility
    const allReviews = await Review.find({});
    const reviews = allReviews.filter(review => {
      // Include reviews that are active and approved, or don't have these fields (backward compatibility)
      const isActive = review.isActive !== false && review.isActive !== undefined ? review.isActive : true;
      const isApproved = review.isApproved !== false && review.isApproved !== undefined ? review.isApproved : true;
      return isActive && isApproved && review.rating;
    });
    
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      averageRating = totalRating / reviews.length;
    }

    // Log for debugging
    console.log("Navbar Statistics:", {
      newProvidersThisWeek,
      completedBookings,
      totalBookings,
      averageRating,
      reviewsCount: reviews.length,
      oneWeekAgo: oneWeekAgo.toISOString()
    });

    res.json({
      newProvidersThisWeek: newProvidersThisWeek || 0,
      completedBookings: completedBookings || 0,
      averageRating: Math.round(averageRating * 10) / 10 || 0 // Round to 1 decimal place
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




