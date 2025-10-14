const express = require("express");
const TeamMember = require("../models/TeamMember");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// Get all active team members (public route)
router.get("/", async (req, res) => {
  try {
    const teamMembers = await TeamMember.find({ isActive: true }).sort({ order: 1 });
    res.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all team members including inactive (admin only)
router.get("/all", isAdmin, async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({ order: 1 });
    res.json(teamMembers);
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
    res.json(teamMember);
  } catch (error) {
    console.error("Error fetching team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new team member (admin only)
router.post("/", isAdmin, async (req, res) => {
  try {
    const { name, role, photo, bio, order, isActive } = req.body;

    // Validation
    if (!name || !role || !photo || !bio) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const teamMember = new TeamMember({
      name,
      role,
      photo,
      bio,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    await teamMember.save();
    res.status(201).json({ message: "Team member created successfully", teamMember });
  } catch (error) {
    console.error("Error creating team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update team member (admin only)
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const { name, role, photo, bio, order, isActive } = req.body;

    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Update fields
    if (name) teamMember.name = name;
    if (role) teamMember.role = role;
    if (photo) teamMember.photo = photo;
    if (bio) teamMember.bio = bio;
    if (order !== undefined) teamMember.order = order;
    if (isActive !== undefined) teamMember.isActive = isActive;

    await teamMember.save();
    res.json({ message: "Team member updated successfully", teamMember });
  } catch (error) {
    console.error("Error updating team member:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete team member (admin only)
router.delete("/:id", isAdmin, async (req, res) => {
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
router.patch("/:id/toggle", isAdmin, async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    teamMember.isActive = !teamMember.isActive;
    await teamMember.save();
    
    res.json({ 
      message: `Team member ${teamMember.isActive ? 'activated' : 'deactivated'} successfully`, 
      teamMember 
    });
  } catch (error) {
    console.error("Error toggling team member status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

