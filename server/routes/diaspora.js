const express = require("express");
const router = express.Router();

// Diaspora community form submission endpoint
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, currentCountry, originCountry, city, interests, skills, message, wantToConnect } = req.body;

    // Basic validation
    if (!name || !email || !currentCountry || !originCountry) {
      return res.status(400).json({ 
        message: "Please fill in all required fields (name, email, currentCountry, originCountry)" 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Create diaspora community record (you can save to database if needed)
    const diasporaData = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      currentCountry: currentCountry.trim(),
      originCountry: originCountry.trim(),
      city: city ? city.trim() : "",
      interests: Array.isArray(interests) ? interests : [],
      skills: skills ? skills.trim() : "",
      message: message ? message.trim() : "",
      wantToConnect: wantToConnect || false,
      timestamp: new Date().toISOString(),
      status: "new"
    };

    // Log the diaspora community form submission (you can replace this with database storage)
    console.log("🌍 New Diaspora Community Member:", {
      ...diasporaData,
      message: message ? message.substring(0, 100) + (message.length > 100 ? "..." : "") : "",
      interestsCount: diasporaData.interests.length
    });

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification to diaspora community coordinator
    // 3. Send welcome email to new member
    // 4. Add to diaspora community mailing list
    // 5. Connect with matching members based on interests/location
    // 6. Invite to diaspora community groups/events

    // For now, we'll just return success
    res.status(201).json({
      message: "Welcome to the Diaspora Community! We'll connect you with other members soon.",
      memberId: diasporaData.id,
      timestamp: diasporaData.timestamp,
      interests: diasporaData.interests
    });

  } catch (error) {
    console.error("Diaspora community form submission error:", error);
    res.status(500).json({ 
      message: "Failed to submit diaspora community form. Please try again later." 
    });
  }
});

// Get diaspora community members (admin endpoint - you might want to add authentication)
router.get("/", async (req, res) => {
  try {
    // This would typically fetch from database
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error("Error fetching diaspora community members:", error);
    res.status(500).json({ 
      message: "Failed to fetch diaspora community members." 
    });
  }
});

module.exports = router;








