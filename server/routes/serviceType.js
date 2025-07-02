const express = require("express");
const router = express.Router();
const ServiceType = require("../models/ServiceType");
const isAdmin = require("../middleware/isAdmin");
const auth = require("../middleware/auth"); // to protect admin-only routes

// Get all types
router.get("/", async (req, res) => {
  try {
    const types = await ServiceType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch types" });
  }
});

// Add new type (admin only)
// Add new type (admin only)
router.post("/", auth, isAdmin, async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const exists = await ServiceType.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Type already exists" });
    }

    const type = new ServiceType({ name, category });
    await type.save();

    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ message: "Failed to create type" });
  }
});
// Get types by category
router.get("/by-category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const types = await ServiceType.find({ category: categoryId });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch types for category" });
  }
});

// Delete type
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    await ServiceType.findByIdAndDelete(req.params.id);
    res.json({ message: "Type deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete type" });
  }
});

module.exports = router;
