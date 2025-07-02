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

// Create a booking
router.post("/", verifyToken, async (req, res) => {
  try {
    const { category, type, service,serviceType, date, note } = req.body;

    console.log("Booking request by:", req.user);
    console.log("Request body:", { category, type, service, date, note });

    if (!service) {
      return res.status(400).json({ message: "Service ID is required" });
    }

   const booking = await Booking.create({
  user: req.user.id,
  category,
  type,
  serviceType, // ✅ Include this field
  service,
  date,
  note,
});

    // Loyalty Points Logic
    const bookingCount = await Booking.countDocuments({ user: req.user.id });
    const points = bookingCount === 1 ? 50 : 20;

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { loyaltyPoints: points },
    });

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




