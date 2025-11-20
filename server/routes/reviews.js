const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Review = require("../models/Review");
const Service = require("../models/Service");
const User = require("../models/User");

const router = express.Router();

/**
 * GET /api/reviews/service/:serviceId - Get all reviews for a service
 */
router.get("/service/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({
      service: serviceId,
      isActive: true,
      isApproved: true,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Format reviews to include guest info or user info
    const formattedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      if (reviewObj.user) {
        return {
          ...reviewObj,
          user: {
            _id: reviewObj.user._id,
            name: reviewObj.user.name,
            email: reviewObj.user.email
          }
        };
      } else {
        return {
          ...reviewObj,
          user: {
            _id: null,
            name: reviewObj.guestInfo?.name || "Guest",
            email: reviewObj.guestInfo?.email || ""
          }
        };
      }
    });

    const total = await Review.countDocuments({
      service: serviceId,
      isActive: true,
      isApproved: true,
    });

    // Calculate average rating
    const ratings = await Review.find({
      service: serviceId,
      isActive: true,
      isApproved: true,
    }).select("rating");

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    // Rating distribution
    const ratingDistribution = {
      5: ratings.filter((r) => r.rating === 5).length,
      4: ratings.filter((r) => r.rating === 4).length,
      3: ratings.filter((r) => r.rating === 3).length,
      2: ratings.filter((r) => r.rating === 2).length,
      1: ratings.filter((r) => r.rating === 1).length,
    };

    res.json({
      reviews: formattedReviews,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      averageRating: averageRating.toFixed(1),
      totalReviews: ratings.length,
      ratingDistribution,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

/**
 * POST /api/reviews - Create a new review (supports both logged-in users and guests)
 */
router.post("/", async (req, res) => {
  try {
    const { serviceId, rating, comment, guestInfo } = req.body;
    
    // Check for authentication token (optional)
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;
    
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id || decoded.userId;
      } catch (err) {
        // Invalid token, proceed as guest
        console.log("Invalid token, proceeding as guest review");
      }
    }

    // Validation
    if (!serviceId || !rating || !comment) {
      return res.status(400).json({
        message: "Service ID, rating, and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // If no user ID, validate guest information
    if (!userId) {
      if (!guestInfo || !guestInfo.name || !guestInfo.email) {
        return res.status(400).json({
          message: "Guest information (name and email) is required for guest reviews",
        });
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestInfo.email)) {
        return res.status(400).json({
          message: "Please provide a valid email address",
        });
      }
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check if user already reviewed this service (only for logged-in users)
    if (userId) {
      const existingReview = await Review.findOne({
        service: serviceId,
        user: userId,
      });

      if (existingReview) {
        // Update existing review
        existingReview.rating = rating;
        existingReview.comment = comment.trim();
        existingReview.isApproved = true; // Re-approve on update
        await existingReview.save();

        await existingReview.populate("user", "name email");

        return res.json({
          message: "Review updated successfully",
          review: existingReview,
        });
      }
    }

    // Create new review
    const reviewData = {
      service: serviceId,
      rating,
      comment: comment.trim(),
    };

    if (userId) {
      reviewData.user = userId;
    } else {
      reviewData.guestInfo = {
        name: guestInfo.name.trim(),
        email: guestInfo.email.trim().toLowerCase(),
      };
    }

    const review = new Review(reviewData);
    await review.save();

    // Populate user data if user exists
    if (userId) {
      await review.populate("user", "name email");
    }

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this service",
      });
    }
    res.status(500).json({ message: "Failed to submit review" });
  }
});

/**
 * PUT /api/reviews/:reviewId - Update a review
 */
router.put("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId) {
      return res.status(403).json({
        message: "You can only update your own reviews",
      });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    await review.save();
    await review.populate("user", "name email");

    res.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
});

/**
 * DELETE /api/reviews/:reviewId - Delete a review
 */
router.delete("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You can only delete your own reviews",
      });
    }

    // Soft delete
    review.isActive = false;
    await review.save();

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
});

/**
 * GET /api/reviews/user/:userId - Get all reviews by a user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({
      user: userId,
      isActive: true,
      isApproved: true,
    })
      .populate("service", "name title category")
      .sort({ createdAt: -1 })
      .exec();

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

module.exports = router;








