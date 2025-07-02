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
    { name: "idCard", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
    { name: "skillLicense", maxCount: 1 },
  ]),
  async (req, res) => {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Only providers can add services" });
    }

    try {
      const { name, category, type, description, price } = req.body;

      const newService = await Service.create({
        name, // still storing name separately
        category,
        type, // ✅ store selected type
        description,
        price,
        provider: req.user.id,
        idCard: req.files?.idCard?.[0]?.path || null,
        businessLicense: req.files?.businessLicense?.[0]?.path || null,
        skillLicense: req.files?.skillLicense?.[0]?.path || null,
      });

      res.status(201).json(newService);
    } catch (err) {
      res.status(500).json({ message: "Service creation failed", error: err.message });
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
        select: "name",
      });

    const availableServices = services.filter((s) => s.provider !== null);

    res.json(availableServices);
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

module.exports = router;
