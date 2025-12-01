const express = require("express");
const router = express.Router();
const JobApplication = require("../models/JobApplication");
const Job = require("../models/Job");
const { authMiddleware } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/upload");
const { getFileUrl } = require("../utils/fileHelper");

/**
 * POST /api/job-applications - Apply for a job
 */
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { jobId, coverLetter, fullName, email, phone, alternativePhone, dateOfBirth, gender, nationality, address, city, country } = req.body;

    // Validation
    if (!jobId || !coverLetter) {
      return res.status(400).json({
        message: "Job ID and cover letter are required",
      });
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.status !== "active") {
      return res.status(400).json({ message: "This job is no longer accepting applications" });
    }

    // Check if user is logged in
    const token = req.headers.authorization?.replace("Bearer ", "");
    let applicantId = null;
    let guestInfo = null;

    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const JWT_SECRET = require("../config/jwt");
        const decoded = jwt.verify(token, JWT_SECRET);
        applicantId = decoded.id;
      } catch (err) {
        // Token invalid, treat as guest
      }
    }

    // If not logged in, require guest info
    if (!applicantId) {
      if (!fullName || !email || !phone || !dateOfBirth || !gender || !nationality || !address || !city || !country) {
        return res.status(400).json({
          message: "All personal and contact information fields are required for guest applications",
        });
      }
      guestInfo = { 
        fullName, 
        email, 
        phone,
        alternativePhone: alternativePhone || undefined,
        dateOfBirth,
        gender,
        nationality,
        address,
        city,
        country,
      };
    } else {
      // For logged-in users, store additional info if provided
      if (fullName || email || phone || dateOfBirth || gender || nationality || address || city || country) {
        guestInfo = {};
        if (fullName) guestInfo.fullName = fullName;
        if (email) guestInfo.email = email;
        if (phone) guestInfo.phone = phone;
        if (alternativePhone) guestInfo.alternativePhone = alternativePhone;
        if (dateOfBirth) guestInfo.dateOfBirth = dateOfBirth;
        if (gender) guestInfo.gender = gender;
        if (nationality) guestInfo.nationality = nationality;
        if (address) guestInfo.address = address;
        if (city) guestInfo.city = city;
        if (country) guestInfo.country = country;
      }
    }

    // Check if user already applied for this job
    const existingApplication = applicantId
      ? await JobApplication.findOne({ job: jobId, applicant: applicantId })
      : await JobApplication.findOne({ job: jobId, "guestInfo.email": email });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
      });
    }

    // Create application
    const application = new JobApplication({
      job: jobId,
      applicant: applicantId || undefined,
      guestInfo: guestInfo || undefined,
      coverLetter,
      resume: req.file ? getFileUrl(req.file) : undefined,
      status: "pending",
    });

    await application.save();
    await application.populate("job", "title");
    if (applicantId) {
      await application.populate("applicant", "name email");
    }

    res.status(201).json(application);
  } catch (error) {
    console.error("Error creating job application:", error);
    res.status(500).json({
      message: "Failed to submit application",
      error: error.message,
    });
  }
});

/**
 * GET /api/job-applications/my-applications - Get user's applications
 */
router.get("/my-applications", authMiddleware, async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user.userId })
      .populate("job", "title location employmentModel specialization")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
});

/**
 * GET /api/job-applications/job/:jobId - Get all applications for a specific job (admin/superadmin only)
 */
router.get("/job/:jobId", authMiddleware, isAdmin, async (req, res) => {
  try {
    const applications = await JobApplication.find({ job: req.params.jobId })
      .populate("applicant", "name email phone")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
});

/**
 * GET /api/job-applications/:id - Get a single application (admin/superadmin only)
 */
router.get("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate("applicant", "name email phone")
      .populate("job", "title location employmentModel specialization");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({
      message: "Failed to fetch application",
      error: error.message,
    });
  }
});

/**
 * PUT /api/job-applications/:id/status - Update application status (admin/superadmin only)
 */
router.put("/:id/status", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !["pending", "reviewed", "shortlisted", "rejected", "accepted"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    if (notes) application.notes = notes;

    await application.save();
    await application.populate("applicant", "name email");
    await application.populate("job", "title");

    res.json(application);
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({
      message: "Failed to update application",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/job-applications/:id - Delete an application (admin/superadmin only)
 */
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    await JobApplication.findByIdAndDelete(req.params.id);

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({
      message: "Failed to delete application",
      error: error.message,
    });
  }
});

module.exports = router;

