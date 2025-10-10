const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/loyalty/balance
router.get("/balance", authMiddleware, async (req, res) => {
  // TODO: fetch real balance for req.user.id
  res.json({ balance: 120 });
});

// GET /api/loyalty/history
router.get("/history", authMiddleware, async (req, res) => {
  // TODO: fetch real history for req.user.id
  res.json([
    { id: "1", date: "2025-06-01T10:00:00.000Z", description: "Signup bonus", points: 50 },
    { id: "2", date: "2025-06-10T14:30:00.000Z", description: "Service completed", points: 70 },
  ]);
});

module.exports = router;
