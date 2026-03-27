const express = require("express");
const router = express.Router();
const ServiceRequest = require("../models/ServiceRequest");
const authMiddleware = require("../middleware/auth");
const { sendServiceRequestNotifications } = require("../utils/notificationService");
const upload = require("../middleware/upload");
const { getFileUrl } = require("../utils/fileHelper");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config/jwt");

const isAdminLike = (role) => ["admin", "superadmin", "support"].includes(role);
const MAX_VIDEO_DURATION_SECONDS = 30 * 60;
const serviceRequestUpload = upload.fields([
  { name: "photos", maxCount: 8 },
  { name: "video", maxCount: 1 },
]);

router.get("/public", async (req, res) => {
  try {
    const docs = await ServiceRequest.find({ status: { $in: ["new", "reviewing"] } })
      .sort({ createdAt: -1 })
      .limit(200);

    const publicRows = docs.map((row) => ({
      _id: row._id,
      serviceNeeded: row.serviceNeeded,
      details: row.details,
      location: row.location,
      budgetEtb: row.budgetEtb,
      preferredDate: row.preferredDate,
      createdAt: row.createdAt,
      status: row.status,
      requesterName: row.fullName,
    }));

    res.json(publicRows);
  } catch (error) {
    console.error("Error fetching public service requests:", error);
    res.status(500).json({ message: "Failed to fetch service requests" });
  }
});

router.post("/", serviceRequestUpload, async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      whatsapp,
      location,
      serviceNeeded,
      preferredDate,
      budgetEtb,
      details,
    } = req.body;

    if (!fullName || !email || !phone || !location || !serviceNeeded || !details) {
      return res.status(400).json({
        message:
          "Missing required fields: fullName, email, phone, location, serviceNeeded, details",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId || null;
      } catch (err) {
        console.warn("Service request posted without valid auth token");
      }
    }

    const photoFiles = Array.isArray(req.files?.photos) ? req.files.photos : [];
    const videoFile = Array.isArray(req.files?.video) ? req.files.video[0] : null;
    const photoUrls = photoFiles
      .map((file) => getFileUrl(file))
      .filter((v) => typeof v === "string" && v.trim() !== "");
    const videoUrl = videoFile ? getFileUrl(videoFile) : undefined;

    let videoDurationSeconds;
    if (req.body.videoDurationSeconds != null && req.body.videoDurationSeconds !== "") {
      videoDurationSeconds = Number(req.body.videoDurationSeconds);
      if (!Number.isFinite(videoDurationSeconds) || videoDurationSeconds < 0) {
        return res.status(400).json({ message: "videoDurationSeconds must be a valid number" });
      }
      if (videoDurationSeconds > MAX_VIDEO_DURATION_SECONDS) {
        return res
          .status(400)
          .json({ message: "Video must be 30 minutes or shorter." });
      }
    }

    const requestDoc = await ServiceRequest.create({
      user: userId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      whatsapp: whatsapp ? whatsapp.trim() : undefined,
      location: location.trim(),
      serviceNeeded: serviceNeeded.trim(),
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      budgetEtb: budgetEtb != null && budgetEtb !== "" ? Number(budgetEtb) : undefined,
      details: details.trim(),
      photoUrls,
      videoUrl,
      videoDurationSeconds,
    });

    res.status(201).json({
      message: "Service request submitted successfully",
      request: requestDoc,
    });

    (async () => {
      try {
        await sendServiceRequestNotifications({
          requester: {
            name: requestDoc.fullName,
            email: requestDoc.email,
            phone: requestDoc.phone,
            whatsapp: requestDoc.whatsapp,
          },
          requestDetails: {
            requestId: requestDoc._id.toString(),
            serviceNeeded: requestDoc.serviceNeeded,
            location: requestDoc.location,
            preferredDate: requestDoc.preferredDate,
            budgetEtb: requestDoc.budgetEtb,
          },
        });
      } catch (notificationError) {
        console.error("Failed to send service request notifications:", notificationError);
      }
    })();
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ message: "Failed to submit service request" });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching my service requests:", error);
    res.status(500).json({ message: "Failed to fetch your service requests" });
  }
});

router.get("/all", authMiddleware, async (req, res) => {
  try {
    if (!isAdminLike(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const requests = await ServiceRequest.find().populate("user", "name email phone").sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching all service requests:", error);
    res.status(500).json({ message: "Failed to fetch service requests" });
  }
});

module.exports = router;
