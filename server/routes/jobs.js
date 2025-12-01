const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const { authMiddleware } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

/**
 * GET /api/jobs - Get all active jobs (public)
 */
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({ status: "active" })
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
});

/**
 * GET /api/jobs/:id - Get a single job by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Failed to fetch job", error: error.message });
  }
});

/**
 * POST /api/jobs - Create a new job (admin/superadmin only)
 */
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, description, location, salary, employmentModel, specialization } = req.body;

    // Validation
    if (!title || !description || !location || !employmentModel || !specialization) {
      return res.status(400).json({ 
        message: "Missing required fields: title, description, location, employmentModel, and specialization are required" 
      });
    }

    const job = new Job({
      title,
      description,
      location,
      salary: salary || "",
      employmentModel,
      specialization,
      postedBy: req.user.userId,
      status: "active",
    });

    await job.save();
    await job.populate("postedBy", "name email");

    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Failed to create job", error: error.message });
  }
});

/**
 * PUT /api/jobs/:id - Update a job (admin/superadmin only)
 */
router.put("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, description, location, salary, employmentModel, specialization, status } = req.body;

    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Update fields
    if (title) job.title = title;
    if (description) job.description = description;
    if (location) job.location = location;
    if (salary !== undefined) job.salary = salary;
    if (employmentModel) job.employmentModel = employmentModel;
    if (specialization) job.specialization = specialization;
    if (status) job.status = status;

    await job.save();
    await job.populate("postedBy", "name email");

    res.json(job);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Failed to update job", error: error.message });
  }
});

/**
 * DELETE /api/jobs/:id - Delete a job (admin/superadmin only)
 */
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Failed to delete job", error: error.message });
  }
});

/**
 * GET /api/jobs/admin/all - Get all jobs including inactive (admin/superadmin only)
 */
router.get("/admin/all", authMiddleware, isAdmin, async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching all jobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs", error: error.message });
  }
});

module.exports = router;
