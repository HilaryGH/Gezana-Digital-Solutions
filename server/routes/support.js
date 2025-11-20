const express = require("express");
const router = express.Router();

// Support/Volunteer form submission endpoint
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message, issueType, priority, volunteerArea, availability } = req.body;

    // Determine if this is a volunteer application or support request
    const isVolunteerApplication = !!volunteerArea;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: "Please fill in all required fields (name, email, subject, message)" 
      });
    }

    // Additional validation for volunteer applications
    if (isVolunteerApplication && !availability) {
      return res.status(400).json({ 
        message: "Please fill in all required fields including availability" 
      });
    }

    // Additional validation for support requests (backward compatibility)
    if (!isVolunteerApplication && !issueType) {
      return res.status(400).json({ 
        message: "Please fill in all required fields including issue type" 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Create support/volunteer record
    const supportData = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
      type: isVolunteerApplication ? "volunteer" : "support",
      // Volunteer fields
      volunteerArea: volunteerArea ? volunteerArea.trim() : null,
      availability: availability ? availability.trim() : null,
      // Support fields (for backward compatibility)
      issueType: issueType ? issueType.trim() : null,
      priority: priority || "medium",
      timestamp: new Date().toISOString(),
      status: "new"
    };

    // Log the submission
    if (isVolunteerApplication) {
      console.log("❤️ New Volunteer Application:", {
        ...supportData,
        message: message.substring(0, 100) + (message.length > 100 ? "..." : "")
      });
    } else {
      console.log("🆘 New Support Request:", {
        ...supportData,
        message: message.substring(0, 100) + (message.length > 100 ? "..." : "")
      });
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification to support/volunteer team
    // 3. Send auto-reply to applicant
    // 4. Create ticket in system
    // 5. Notify dashboard

    // Return success
    res.status(201).json({
      message: isVolunteerApplication 
        ? "Thank you for your interest in volunteering! We've received your application and will review it within 24-48 hours."
        : "Thank you for contacting support! We'll get back to you within 24 hours.",
      supportId: supportData.id,
      timestamp: supportData.timestamp,
      type: supportData.type
    });

  } catch (error) {
    console.error("Form submission error:", error);
    res.status(500).json({ 
      message: "Failed to submit form. Please try again later." 
    });
  }
});

// Get support requests (admin endpoint - you might want to add authentication)
router.get("/", async (req, res) => {
  try {
    // This would typically fetch from database
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error("Error fetching support requests:", error);
    res.status(500).json({ 
      message: "Failed to fetch support requests." 
    });
  }
});

module.exports = router;




