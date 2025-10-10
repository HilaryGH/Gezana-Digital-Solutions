// routes/provider.js
const express = require("express");
const User = require("../models/User");
const upload = require("../middleware/upload");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Upload provider credentials
router.post("/upload-credentials", authMiddleware, upload.array("files", 5), async (req, res) => {
  try {
    const provider = await User.findById(req.user.userId);
    const filenames = req.files.map((file) => `/uploads/credentials/${file.filename}`);

    provider.credentials.push(...filenames);
    await provider.save();

    res.status(200).json({ message: "Credentials uploaded", credentials: provider.credentials });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});
// routes/admin.js
router.get("/providers", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Unauthorized" });

    const providers = await User.find({ role: "provider" });

    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching providers" });
  }
});


module.exports = router;
