const express = require("express");
const TeamMember = require("../models/TeamMember");
const { authMiddleware } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/upload");
const path = require("path");

const router = express.Router();

// Helper function to normalize photo URL
const normalizePhotoUrl = (photo, req) => {
  if (!photo) return photo;
  // If already a full URL (starts with http:// or https://), return as is
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo;
  }
  // If it's a relative path starting with /uploads, make it a full URL
  if (photo.startsWith('/uploads/')) {
    const baseUrl = req.protocol + '://' + req.get('host');
    return `${baseUrl}${photo}`;
  }
  // Otherwise return as is (might be a full URL without protocol or something else)
  return photo;
};

// Get all active team members (public route)
router.get("/", async (req, res) => {
  try {
    const teamMembers = await TeamMember.find({ isActive: true }).sort({ order: 1 });
    // Normalize photo URLs
    const normalizedMembers = teamMembers.map(member => ({
      ...member.toObject(),
      photo: normalizePhotoUrl(member.photo, req)
    }));
    res.json(normalizedMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all team members including inactive (admin only)
router.get("/all", authMiddleware, isAdmin, async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({ order: 1 });
    // Normalize photo URLs
    const normalizedMembers = teamMembers.map(member => ({
      ...member.toObject(),
      photo: normalizePhotoUrl(member.photo, req)
    }));
    res.json(normalizedMembers);
  } catch (error) {
    console.error("Error fetching all team members:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single team member by ID
router.get("/:id", async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }
    // Normalize photo URL
    const normalizedMember = {
      ...teamMember.toObject(),
      photo: normalizePhotoUrl(teamMember.photo, req)
    };
    res.json(normalizedMember);
  } catch (error) {
    console.error("Error fetching team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new team member (admin only) - supports file upload or URL
router.post("/", authMiddleware, isAdmin, upload.single("photo"), async (req, res) => {
  try {
    const { 
      name, 
      role, 
      photo, 
      bio, 
      email, 
      phone, 
      location, 
      education, 
      experience, 
      skills, 
      linkedin, 
      twitter, 
      facebook, 
      order, 
      isActive 
    } = req.body;

    // Validation
    if (!name || !role || !bio) {
      return res.status(400).json({ message: "Please provide name, role, and bio" });
    }

    // Handle photo: use uploaded file if available, otherwise use URL from body
    let photoUrl = photo;
    if (req.file) {
      // If file was uploaded, use the file path with full URL
      const baseUrl = req.protocol + '://' + req.get('host');
      photoUrl = `${baseUrl}/uploads/${req.file.filename}`;
    } else if (!photoUrl) {
      return res.status(400).json({ message: "Please provide a photo (upload file or URL)" });
    }

    // Parse skills if it's a string (from form data)
    let skillsArray = [];
    if (skills) {
      if (typeof skills === 'string') {
        skillsArray = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      } else if (Array.isArray(skills)) {
        skillsArray = skills;
      }
    }

    const teamMember = new TeamMember({
      name,
      role,
      photo: photoUrl,
      bio,
      email: email || "",
      phone: phone || "",
      location: location || "",
      education: education || "",
      experience: experience || "",
      skills: skillsArray,
      linkedin: linkedin || "",
      twitter: twitter || "",
      facebook: facebook || "",
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    await teamMember.save();
    // Normalize photo URL in response
    const normalizedMember = {
      ...teamMember.toObject(),
      photo: normalizePhotoUrl(teamMember.photo, req)
    };
    res.status(201).json({ message: "Team member created successfully", teamMember: normalizedMember });
  } catch (error) {
    console.error("Error creating team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update team member (admin only) - supports file upload or URL
router.put("/:id", authMiddleware, isAdmin, upload.single("photo"), async (req, res) => {
  try {
    const { 
      name, 
      role, 
      photo, 
      bio, 
      email, 
      phone, 
      location, 
      education, 
      experience, 
      skills, 
      linkedin, 
      twitter, 
      facebook, 
      order, 
      isActive 
    } = req.body;

    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Update fields
    if (name) teamMember.name = name;
    if (role) teamMember.role = role;
    if (bio) teamMember.bio = bio;
    if (email !== undefined) teamMember.email = email;
    if (phone !== undefined) teamMember.phone = phone;
    if (location !== undefined) teamMember.location = location;
    if (education !== undefined) teamMember.education = education;
    if (experience !== undefined) teamMember.experience = experience;
    if (linkedin !== undefined) teamMember.linkedin = linkedin;
    if (twitter !== undefined) teamMember.twitter = twitter;
    if (facebook !== undefined) teamMember.facebook = facebook;
    if (order !== undefined) teamMember.order = order;
    if (isActive !== undefined) teamMember.isActive = isActive;

    // Handle skills
    if (skills !== undefined) {
      if (typeof skills === 'string') {
        teamMember.skills = skills.split(',').map(skill => skill.trim()).filter(skill => skill);
      } else if (Array.isArray(skills)) {
        teamMember.skills = skills;
      }
    }

    // Handle photo: use uploaded file if available, otherwise use URL from body
    if (req.file) {
      const baseUrl = req.protocol + '://' + req.get('host');
      teamMember.photo = `${baseUrl}/uploads/${req.file.filename}`;
    } else if (photo) {
      teamMember.photo = photo;
    }

    await teamMember.save();
    // Normalize photo URL in response
    const normalizedMember = {
      ...teamMember.toObject(),
      photo: normalizePhotoUrl(teamMember.photo, req)
    };
    res.json({ message: "Team member updated successfully", teamMember: normalizedMember });
  } catch (error) {
    console.error("Error updating team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete team member (admin only)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle active status (admin only)
router.patch("/:id/toggle", authMiddleware, isAdmin, async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    teamMember.isActive = !teamMember.isActive;
    await teamMember.save();
    
    // Normalize photo URL in response
    const normalizedMember = {
      ...teamMember.toObject(),
      photo: normalizePhotoUrl(teamMember.photo, req)
    };
    
    res.json({ 
      message: `Team member ${teamMember.isActive ? 'activated' : 'deactivated'} successfully`, 
      teamMember: normalizedMember
    });
  } catch (error) {
    console.error("Error toggling team member status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

