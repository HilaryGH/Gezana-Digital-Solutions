const express = require("express");
const router = express.Router();

// Contact form submission endpoint
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, subject, message, serviceType } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        message: "Please fill in all required fields (name, email, subject, message)" 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Create contact record (you can save to database if needed)
    const contactData = {
      id: Date.now().toString(), // Simple ID generation
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
      serviceType: serviceType || "",
      timestamp: new Date().toISOString(),
      status: "new"
    };

    // Log the contact form submission (you can replace this with database storage)
    console.log("📧 New Contact Form Submission:", {
      ...contactData,
      message: message.substring(0, 100) + (message.length > 100 ? "..." : "")
    });

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Send auto-reply to customer
    // 4. Integrate with CRM system

    // For now, we'll just return success
    res.status(201).json({
      message: "Thank you for your message! We'll get back to you soon.",
      contactId: contactData.id,
      timestamp: contactData.timestamp
    });

  } catch (error) {
    console.error("Contact form submission error:", error);
    res.status(500).json({ 
      message: "Failed to submit contact form. Please try again later." 
    });
  }
});

// Get contact submissions (admin endpoint - you might want to add authentication)
router.get("/", async (req, res) => {
  try {
    // This would typically fetch from database
    // For now, return empty array or implement as needed
    res.json({
      message: "Contact submissions endpoint",
      submissions: []
    });
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    res.status(500).json({ 
      message: "Failed to fetch contact submissions" 
    });
  }
});

// Get single contact submission by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would typically fetch from database by ID
    // For now, return placeholder
    res.json({
      message: `Contact submission ${id}`,
      submission: null
    });
  } catch (error) {
    console.error("Error fetching contact submission:", error);
    res.status(500).json({ 
      message: "Failed to fetch contact submission" 
    });
  }
});

// Update contact submission status (admin endpoint)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be one of: new, in-progress, resolved, closed" 
      });
    }

    // This would typically update in database
    console.log(`📝 Contact submission ${id} status updated to: ${status}`);

    res.json({
      message: "Contact submission status updated successfully",
      id,
      status
    });
  } catch (error) {
    console.error("Error updating contact submission:", error);
    res.status(500).json({ 
      message: "Failed to update contact submission" 
    });
  }
});

// Delete contact submission (admin endpoint)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // This would typically delete from database
    console.log(`🗑️ Contact submission ${id} deleted`);

    res.json({
      message: "Contact submission deleted successfully",
      id
    });
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    res.status(500).json({ 
      message: "Failed to delete contact submission" 
    });
  }
});

module.exports = router;
