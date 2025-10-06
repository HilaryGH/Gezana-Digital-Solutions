const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const Service = require("../models/Service");
const upload = require("../middleware/upload");

const router = express.Router();

/**
 * GET /api/services/mine
 */
router.get("/mine", verifyToken, async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id })
      .populate("category", "name"); // 👈 This is important

    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/services
 */
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "photos", maxCount: 5 }, // Allow multiple photos
  ]),
  async (req, res) => {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can add services" });
    }

    try {
      const { 
        title, 
        description, 
        category, 
        subcategory, 
        price, 
        priceType, 
        location 
      } = req.body;

      // Create service with new structure
      const newService = await Service.create({
        name: title, // Map title to name
        category: category, // Store as string for now
        type: subcategory, // Map subcategory to type
        description,
        price: parseFloat(price),
        provider: req.user.id,
        // Handle photo uploads
        photos: req.files?.photos?.map(file => file.path) || [],
        // Optional fields
        priceType: priceType || 'fixed',
        location: location || '',
      });

      res.status(201).json(newService);
    } catch (err) {
      console.error("Service creation error:", err);
      res.status(500).json({ 
        message: "Service creation failed", 
        error: err.message 
      });
    }
  }
);

/**
 * GET /api/services/categories
 */
router.get("/categories", async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).select("category");
    const uniqueCategories = [...new Set(services.map((s) => s.category))];
    res.json(uniqueCategories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

/**
 * GET /api/services
 */
router.get("/", async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;

  try {
    const services = await Service.find(filter)
      .populate("category", "name")
      .populate("type", "name")
      .populate({
        path: "provider",
        match: { isActive: true },
        select: "name email rating",
      });

    const availableServices = services.filter((s) => s.provider !== null);

    // Transform the data to match client expectations
    const transformedServices = availableServices.map(service => ({
      id: service._id,
      title: service.name, // Map name to title
      description: service.description,
      category: service.category?.name || service.category,
      subcategory: service.type?.name || service.type,
      price: service.price,
      priceType: service.priceType,
      photos: service.photos.map(photo => {
        if (photo.startsWith('http')) return photo;
        // Handle different photo path formats
        const cleanPhoto = photo.replace(/\\/g, '/').replace(/^uploads\//, '');
        return `${req.protocol}://${req.get('host')}/${cleanPhoto}`;
      }),
      providerId: service.provider._id,
      providerName: service.provider.name,
      providerRating: service.provider.rating || 4.5, // Default rating if not available
      isAvailable: service.isActive,
      location: service.location,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }));

    res.json(transformedServices);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch services" });
  }
});


/**
 * PUT /api/services/:id
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const svc = await Service.findOne({ _id: req.params.id, provider: req.user.id });
    if (!svc) return res.status(404).json({ message: "Service not found" });

    const { name, category, type, description, price, isActive } = req.body;

    if (name !== undefined) svc.name = name;
    if (category !== undefined) svc.category = category;
    if (type !== undefined) svc.type = type; // ✅ allow type update
    if (description !== undefined) svc.description = description;
    if (price !== undefined) svc.price = price;
    if (isActive !== undefined) svc.isActive = isActive;

    await svc.save();
    res.json(svc);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

/**
 * DELETE /api/services/:id
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      provider: req.user.id,
    });

    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete service" });
  }
});

/**
 * GET /api/services/grouped
 */
router.get("/grouped", async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).populate("provider", "name email");

    const grouped = {};
    for (const service of services) {
      if (!grouped[service.category]) grouped[service.category] = [];
      grouped[service.category].push({
        providerName: service.provider?.name || "Unknown",
        serviceName: service.name,
        serviceType: service.type, // ✅ include type in grouped result
        serviceId: service._id,
      });
    }

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch grouped services" });
  }
});
// GET /api/services/by-category?name=Plumbing
router.get("/by-category", async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const services = await Service.find({ category: name, isActive: true }).select("_id name");
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch services", error: err.message });
  }
});
// GET /services/by-filter
router.get("/by-filter", async (req, res) => {
  const { category, type } = req.query;

  try {
    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;

    const services = await Service.find(query).select("name type price");

    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch services", error: err.message });
  }
});

// Admin routes for service management
/**
 * GET /api/admin/services - Get all services for admin
 */
router.get("/admin/services", verifyToken, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const services = await Service.find({})
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    console.error("Error fetching admin services:", err);
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

/**
 * PUT /api/admin/services/:id/approve - Approve a service
 */
router.put("/admin/services/:id/approve", verifyToken, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).populate("provider", "name email");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service approved successfully", service });
  } catch (err) {
    console.error("Error approving service:", err);
    res.status(500).json({ message: "Failed to approve service" });
  }
});

/**
 * PUT /api/admin/services/:id/reject - Reject a service
 */
router.put("/admin/services/:id/reject", verifyToken, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).populate("provider", "name email");

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service rejected successfully", service });
  } catch (err) {
    console.error("Error rejecting service:", err);
    res.status(500).json({ message: "Failed to reject service" });
  }
});

/**
 * DELETE /api/admin/services/:id - Delete a service (admin only)
 */
router.delete("/admin/services/:id", verifyToken, async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ message: "Failed to delete service" });
  }
});

module.exports = router;
