const express = require("express");
const axios = require("axios");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

router.post("/initialize", verifyToken, async (req, res) => {
  const { amount, email, first_name, last_name, tx_ref, return_url } = req.body;

  try {
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        first_name,
        last_name,
        tx_ref,
        return_url,
        callback_url: return_url,
        customizations: {
          title: "Gezana Service Payment",
          description: "Service booking payment",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Chapa Init Error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to initialize payment",
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
