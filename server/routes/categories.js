const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const Category = require("../models/Category");

const router = express.Router();

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// POST create a new category (admin only)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });

  try {
    const exists = await Category.findOne({ name: name.trim() });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const category = new Category({ name: name.trim() });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to create category" });
  }
});

// DELETE category by id (admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category" });
  }
});

module.exports = router;
