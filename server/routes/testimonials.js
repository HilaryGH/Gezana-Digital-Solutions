const express = require("express");
const Testimonial = require("../models/Testimonial");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// Get all approved and active testimonials (public route)
router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ 
      isApproved: true, 
      isActive: true 
    }).sort({ order: 1, createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all testimonials including unapproved (admin only)
router.get("/all", isAdmin, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    console.error("Error fetching all testimonials:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single testimonial by ID
router.get("/:id", async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.json(testimonial);
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit new testimonial (public route - but needs approval)
router.post("/", async (req, res) => {
  try {
    const { name, email, photo, text, rating } = req.body;

    // Validation
    if (!name || !text) {
      return res.status(400).json({ message: "Please provide name and testimonial text" });
    }

    const testimonial = new Testimonial({
      name,
      email: email || undefined,
      photo: photo || "https://randomuser.me/api/portraits/lego/1.jpg",
      text,
      rating: rating || 5,
      isApproved: false, // Requires admin approval
      isActive: true,
      order: 0,
    });

    await testimonial.save();
    res.status(201).json({ 
      message: "Thank you for your testimonial! It will be reviewed and published shortly.",
      testimonial 
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update testimonial (admin only)
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const { name, email, photo, text, rating, isApproved, isActive, order } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    // Update fields
    if (name) testimonial.name = name;
    if (email !== undefined) testimonial.email = email;
    if (photo) testimonial.photo = photo;
    if (text) testimonial.text = text;
    if (rating !== undefined) testimonial.rating = rating;
    if (isApproved !== undefined) testimonial.isApproved = isApproved;
    if (isActive !== undefined) testimonial.isActive = isActive;
    if (order !== undefined) testimonial.order = order;

    await testimonial.save();
    res.json({ message: "Testimonial updated successfully", testimonial });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete testimonial (admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve testimonial (admin only)
router.patch("/:id/approve", isAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.isApproved = true;
    await testimonial.save();
    
    res.json({ 
      message: "Testimonial approved successfully", 
      testimonial 
    });
  } catch (error) {
    console.error("Error approving testimonial:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject/Unapprove testimonial (admin only)
router.patch("/:id/reject", isAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.isApproved = false;
    await testimonial.save();
    
    res.json({ 
      message: "Testimonial rejected successfully", 
      testimonial 
    });
  } catch (error) {
    console.error("Error rejecting testimonial:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle active status (admin only)
router.patch("/:id/toggle", isAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }

    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();
    
    res.json({ 
      message: `Testimonial ${testimonial.isActive ? 'activated' : 'deactivated'} successfully`, 
      testimonial 
    });
  } catch (error) {
    console.error("Error toggling testimonial status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

