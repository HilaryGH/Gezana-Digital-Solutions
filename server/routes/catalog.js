const express = require("express");
const Service = require("../models/Service");
const AgentProfessional = require("../models/AgentProfessional");

const router = express.Router();

/**
 * Normalize category from Service (string ID, plain string, or populated { name }).
 */
function resolveServiceCategory(category) {
  if (category == null || category === "") return "";
  if (typeof category === "object" && category !== null && category.name != null) {
    return String(category.name);
  }
  return String(category);
}

/**
 * Map a Service document (lean) to the unified catalog shape.
 */
function toProviderCatalogItem(service) {
  return {
    _id: service._id,
    title: service.name,
    price: service.price,
    category: resolveServiceCategory(service.category),
    providerName: service.provider?.name ? String(service.provider.name) : "",
    source: "provider",
  };
}

/**
 * Map an AgentProfessional document (lean) to the unified catalog shape.
 */
function defaultProfessionalBookingPrice() {
  const n = Number(process.env.AGENT_PROFESSIONAL_DEFAULT_BOOKING_PRICE);
  return Number.isFinite(n) && n > 0 ? n : 500;
}

function toAgentCatalogItem(pro) {
  const serviceType = pro.serviceType?.trim() || "";
  const city = pro.city?.trim() || "";
  const loc = pro.location?.trim() || "";
  return {
    _id: pro._id,
    title: serviceType || pro.fullName,
    price: null,
    suggestedBookingPrice: defaultProfessionalBookingPrice(),
    category: serviceType,
    providerName: pro.fullName,
    source: "agent",
    phone: pro.phone ?? null,
    email: pro.email ?? null,
    whatsapp: pro.whatsapp ?? null,
    telegram: pro.telegram ?? null,
    city: city || null,
    location: loc || null,
    notes: pro.notes ?? null,
    status: pro.status ?? "pending",
    photo: pro.photo ?? null,
    createdAt: pro.createdAt,
    updatedAt: pro.updatedAt,
  };
}

/**
 * GET /api/catalog
 * Combined catalog: provider services + agent-submitted professionals.
 */
router.get("/", async (req, res) => {
  try {
    const [services, agentProfessionals] = await Promise.all([
      Service.find({ isActive: true })
        .populate("category", "name")
        .populate({
          path: "provider",
          match: { isActive: true },
          select: "name",
        })
        .lean()
        .exec(),
      AgentProfessional.find({ status: "approved" })
        .lean()
        .exec(),
    ]);

    const fromProviders = services
      .filter((s) => s.provider != null)
      .map(toProviderCatalogItem);

    const fromAgents = agentProfessionals.map(toAgentCatalogItem);

    const catalog = [...fromProviders, ...fromAgents];

    res.json(catalog);
  } catch (err) {
    console.error("GET /api/catalog:", err);
    res.status(500).json({
      message: "Failed to load catalog",
      ...(process.env.NODE_ENV !== "production" && { error: err.message }),
    });
  }
});

module.exports = router;
