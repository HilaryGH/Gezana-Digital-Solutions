const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Service = require("../models/Service");
const User = require("../models/User");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const upload = require("../middleware/upload");
const { sendServicePublishedNotifications } = require("../utils/notificationService");
const { getFileUrl } = require("../utils/fileHelper");

const router = express.Router();

// Helper function to build file base URL (works in production behind proxy and mobile)
const buildFileBaseUrl = (req) => {
  // Always prioritize NODE_ENV check first
  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production, use production URL
  if (isProduction) {
    const envBase = process.env.FILE_BASE_URL || process.env.SERVER_URL || process.env.BASE_URL;
    if (envBase) {
      return envBase.replace(/\/$/, "");
    }
    return 'https://gezana-api.onrender.com';
  }
  
  // In development, detect the actual request origin (works for mobile on same network)
  // Check for proxy headers first (X-Forwarded-*)
  const forwardedProto = req.get('X-Forwarded-Proto') || req.get('x-forwarded-proto');
  const forwardedHost = req.get('X-Forwarded-Host') || req.get('x-forwarded-host');
  
  // Use forwarded headers if available (behind proxy)
  if (forwardedProto && forwardedHost) {
    const devUrl = `${forwardedProto}://${forwardedHost}`;
    console.log('Building file base URL (proxy headers):', { forwardedProto, forwardedHost, devUrl });
    return devUrl;
  }
  
  // Fallback: use request protocol and host (works for mobile on same network)
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `localhost:${process.env.PORT || 5000}`;
  
  // For mobile devices on same network, use the actual host IP/domain
  // This will work if accessing via IP address or local network domain
  const devUrl = `${protocol}://${host}`;
  
  console.log('Building file base URL (request origin):', { 
    NODE_ENV: process.env.NODE_ENV, 
    isProduction, 
    protocol,
    host,
    devUrl 
  });
  
  return devUrl;
};

// Helper function to check if a URL is a Cloudinary URL
const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

// Helper function to convert photo path to full URL
// Prioritizes Cloudinary URLs, handles both Cloudinary URLs (stored as full URLs) and local filenames
const getPhotoUrl = (req, photo) => {
  if (!photo) return null;
  
  const photoStr = String(photo).trim();
  if (!photoStr) return null;
  
  // PRIORITY 1: Check if it's already a full Cloudinary URL
  if (photoStr.startsWith('http://') || photoStr.startsWith('https://')) {
    // Verify it's a valid Cloudinary URL
    if (isCloudinaryUrl(photoStr)) {
      console.log('☁️  Using Cloudinary URL:', photoStr);
      return photoStr;
    }
    
    // In development ONLY, convert production URLs to localhost
    // In production, return production URLs as-is
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction && photoStr.includes('gezana-api.onrender.com')) {
      // Extract the path from the production URL
      const urlPath = photoStr.replace(/^https?:\/\/[^/]+/, '');
      const localhostUrl = `${buildFileBaseUrl(req)}${urlPath}`;
      console.log('🔄 Converting production URL to localhost (DEV ONLY):', {
        original: photoStr,
        converted: localhostUrl
      });
      return localhostUrl;
    }
    
    // In production, return production URLs as-is (don't modify them)
    if (isProduction && photoStr.includes('gezana-api.onrender.com')) {
      console.log('✅ Using production URL:', photoStr);
      return photoStr;
    }
    
    // Other external URLs (shouldn't happen, but handle gracefully)
    if (!isProduction) {
      console.log('⚠️  External URL detected (not Cloudinary):', photoStr);
    }
    return photoStr;
  }
  
  // At this point, it's a local filename (not a full URL)
  // Handle local file paths - clean up the filename
  let cleanPhoto = photoStr;
  
  // Remove backslashes and normalize to forward slashes (Windows paths)
  cleanPhoto = cleanPhoto.replace(/\\/g, '/');
  
  // Remove "uploads/" prefix if present (shouldn't be there, but handle it)
  cleanPhoto = cleanPhoto.replace(/^uploads\//, '');
  
  // Remove leading slash if present
  cleanPhoto = cleanPhoto.replace(/^\//, '');
  
  // Trim whitespace again after cleaning
  cleanPhoto = cleanPhoto.trim();
  
  if (!cleanPhoto) {
    console.warn('⚠️  Empty photo after cleaning:', photo);
    return null;
  }
  
  // Get base URL for local files
  const baseUrl = buildFileBaseUrl(req);
  
  // Construct full URL for local files
  const fullUrl = `${baseUrl}/uploads/${cleanPhoto}`;
  
  // Log for debugging
  console.log('📁 Local file URL construction:', { 
    original: photo, 
    cleaned: cleanPhoto, 
    baseUrl, 
    fullUrl 
  });
  
  return fullUrl;
};

/**
 * GET /api/services/mine
 */
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.userId })
      .populate("category", "name");

    // Transform services to include full photo URLs
    const transformedServices = services.map(service => ({
      ...service.toObject(),
      photos: service.photos.map(photo => getPhotoUrl(req, photo)).filter(Boolean)
    }));

    res.json(transformedServices);
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
  authMiddleware,
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
        provider: req.user.userId,
        // Handle photo uploads - Cloudinary will return full URLs
        photos: req.files?.photos?.map(file => {
          const fileUrl = getFileUrl(file);
          console.log('📸 Service photo upload:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            url: fileUrl,
            isCloudinary: isCloudinaryUrl(fileUrl)
          });
          
          // Ensure we're using Cloudinary URL if available
          if (fileUrl && isCloudinaryUrl(fileUrl)) {
            console.log('✅ Photo uploaded to Cloudinary:', fileUrl);
          } else if (fileUrl) {
            console.warn('⚠️  Photo not uploaded to Cloudinary, using:', fileUrl);
          }
          
          return fileUrl;
        }).filter(Boolean) || [],
        // Optional fields
        priceType: priceType || 'fixed',
        location: location || '',
      });

      // Send service published notifications
      try {
        const provider = await User.findById(req.user.userId);
        if (provider) {
          const notificationResults = await sendServicePublishedNotifications({
            email: provider.email,
            name: provider.name,
            phone: provider.phone,
            whatsapp: provider.whatsapp
          }, newService.name);
          console.log("Service published notifications sent:", notificationResults);
        }
      } catch (notifError) {
        console.error("Error sending service notifications:", notifError);
        // Don't fail service creation if notifications fail
      }

      // Populate and transform the service to return with proper photo URLs
      await newService.populate("provider", "name email");
      
      // Transform photos to full URLs - prioritize Cloudinary
      const transformedPhotos = newService.photos.map(photo => {
        if (!photo) return null;
        
        // If photo is already a full Cloudinary URL, return as is
        if (photo.startsWith('http://') || photo.startsWith('https://')) {
          if (isCloudinaryUrl(photo)) {
            console.log('☁️  Photo is already Cloudinary URL:', photo);
            return photo;
          }
          // Other external URL, return as is
          return photo;
        }
        
        // Otherwise, construct URL for local files (fallback)
        const fullUrl = getPhotoUrl(req, photo);
        console.log('📸 Transforming photo URL:', { original: photo, transformed: fullUrl, isCloudinary: isCloudinaryUrl(fullUrl) });
        return fullUrl;
      }).filter(Boolean);
      
      const transformedService = {
        ...newService.toObject(),
        photos: transformedPhotos
      };

      console.log('Service created with photos:', transformedPhotos);
      res.status(201).json(transformedService);
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
 * GET /api/services - Get all services
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

    // Get service ratings from reviews
    const serviceIds = availableServices.map(s => s._id);
    const reviews = await Review.find({
      service: { $in: serviceIds },
      isActive: true,
      isApproved: true
    }).select('service rating');

    // Calculate average rating for each service
    const serviceRatings = {};
    reviews.forEach(review => {
      const serviceId = review.service.toString();
      if (!serviceRatings[serviceId]) {
        serviceRatings[serviceId] = { sum: 0, count: 0 };
      }
      serviceRatings[serviceId].sum += review.rating;
      serviceRatings[serviceId].count += 1;
    });

    // Transform the data to match client expectations
    const transformedServices = await Promise.all(availableServices.map(async service => {
      const serviceId = service._id.toString();
      const ratingData = serviceRatings[serviceId];
      const serviceRating = ratingData && ratingData.count > 0 
        ? parseFloat((ratingData.sum / ratingData.count).toFixed(1))
        : null;

      // Safely handle photos array - ensure it's an array and transform URLs
      const photos = Array.isArray(service.photos) && service.photos.length > 0
        ? service.photos.map(photo => getPhotoUrl(req, photo)).filter(Boolean)
        : [];

      return {
        id: service._id,
        title: service.name, // Map name to title
        description: service.description,
        category: service.category?.name || service.category,
        subcategory: service.type?.name || service.type,
        price: service.price,
        priceType: service.priceType,
        photos: photos,
        providerId: service.provider._id,
        providerName: service.provider.name,
        providerRating: service.provider.rating || 4.5, // Provider's overall rating
        serviceRating: serviceRating, // Service-specific rating from reviews (null if no reviews)
        ratingCount: ratingData ? ratingData.count : 0, // Number of ratings
        isAvailable: service.isActive,
        location: service.location,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      };
    }));

    res.json(transformedServices);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch services" });
  }
});

/**
 * GET /api/services/recent - Get recently added services
 */
router.get("/recent", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const services = await Service.find({ isActive: true })
      .populate("category", "name")
      .populate("type", "name")
      .populate({
        path: "provider",
        match: { isActive: true },
        select: "name email rating",
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    const availableServices = services.filter((s) => s.provider !== null);

    // Debug: Log raw service data to see what we're working with
    console.log('📋 Recent services - Raw data check:', {
      totalServices: availableServices.length,
      servicesWithPhotos: availableServices.filter(s => s.photos && s.photos.length > 0).length,
      sampleService: availableServices[0] ? {
        id: availableServices[0]._id,
        name: availableServices[0].name,
        photosCount: availableServices[0].photos?.length || 0,
        photos: availableServices[0].photos
      } : null
    });

    // Get service ratings from reviews
    const serviceIds = availableServices.map(s => s._id);
    const reviews = await Review.find({
      service: { $in: serviceIds },
      isActive: true,
      isApproved: true
    }).select('service rating');

    // Calculate average rating for each service
    const serviceRatings = {};
    reviews.forEach(review => {
      const serviceId = review.service.toString();
      if (!serviceRatings[serviceId]) {
        serviceRatings[serviceId] = { sum: 0, count: 0 };
      }
      serviceRatings[serviceId].sum += review.rating;
      serviceRatings[serviceId].count += 1;
    });

    // Transform the data
    const transformedServices = availableServices.map(service => {
      const serviceId = service._id.toString();
      const ratingData = serviceRatings[serviceId];
      const serviceRating = ratingData && ratingData.count > 0 
        ? parseFloat((ratingData.sum / ratingData.count).toFixed(1))
        : null;

      // Safely handle photos array - ensure it's an array and transform URLs
      const photos = Array.isArray(service.photos) && service.photos.length > 0
        ? service.photos.map(photo => {
            const photoUrl = getPhotoUrl(req, photo);
            console.log('🖼️  Recent service photo transformation:', {
              serviceId: service._id,
              serviceName: service.name,
              original: photo,
              transformed: photoUrl,
              isCloudinary: photoUrl && (photoUrl.includes('cloudinary.com') || photoUrl.includes('localhost'))
            });
            return photoUrl;
          }).filter(Boolean)
        : [];

      if (photos.length === 0 && service.photos && service.photos.length > 0) {
        console.warn('⚠️  Recent service photos were filtered out:', {
          serviceId: service._id,
          serviceName: service.name,
          originalPhotos: service.photos
        });
      }

      return {
        id: service._id,
        title: service.name,
        description: service.description,
        category: service.category?.name || service.category,
        subcategory: service.type?.name || service.type,
        price: service.price,
        priceType: service.priceType,
        photos: photos,
        providerId: service.provider._id,
        providerName: service.provider.name,
        providerRating: service.provider.rating || 4.5,
        serviceRating: serviceRating,
        ratingCount: ratingData ? ratingData.count : 0,
        isAvailable: service.isActive,
        location: service.location,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      };
    });

    res.json(transformedServices);
  } catch (err) {
    console.error("Error fetching recent services:", err);
    res.status(500).json({ message: "Could not fetch recent services", error: err.message });
  }
});

/**
 * GET /api/services/most-booked - Get most booked services
 */
router.get("/most-booked", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Aggregate bookings to count bookings per service
    const bookingCounts = await Booking.aggregate([
      {
        $group: {
          _id: "$service",
          bookingCount: { $sum: 1 }
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: limit
      }
    ]);

    // If no bookings exist, return empty array
    if (!bookingCounts || bookingCounts.length === 0) {
      return res.json([]);
    }

    // Filter out bookings with null service IDs
    const validBookingCounts = bookingCounts.filter(b => b._id !== null && b._id !== undefined);
    
    if (validBookingCounts.length === 0) {
      return res.json([]);
    }

    const serviceIds = validBookingCounts.map(b => b._id).filter(id => id !== null);
    const bookingCountMap = {};
    validBookingCounts.forEach(b => {
      if (b._id) {
        bookingCountMap[b._id.toString()] = b.bookingCount;
      }
    });

    // Fetch services with booking counts
    const services = await Service.find({
      _id: { $in: serviceIds },
      isActive: true
    })
      .populate("category", "name")
      .populate("type", "name")
      .populate({
        path: "provider",
        match: { isActive: true },
        select: "name email rating",
      });

    const availableServices = services.filter((s) => s.provider !== null);

    // Sort services by booking count (maintain order from aggregation)
    availableServices.sort((a, b) => {
      const countA = bookingCountMap[a._id.toString()] || 0;
      const countB = bookingCountMap[b._id.toString()] || 0;
      return countB - countA;
    });

    // Get service ratings from reviews
    const reviewServiceIds = availableServices.map(s => s._id);
    const reviews = await Review.find({
      service: { $in: reviewServiceIds },
      isActive: true,
      isApproved: true
    }).select('service rating');

    // Calculate average rating for each service
    const serviceRatings = {};
    reviews.forEach(review => {
      const serviceId = review.service.toString();
      if (!serviceRatings[serviceId]) {
        serviceRatings[serviceId] = { sum: 0, count: 0 };
      }
      serviceRatings[serviceId].sum += review.rating;
      serviceRatings[serviceId].count += 1;
    });

    // Transform the data
    const transformedServices = availableServices.map(service => {
      const serviceId = service._id.toString();
      const ratingData = serviceRatings[serviceId];
      const serviceRating = ratingData && ratingData.count > 0 
        ? parseFloat((ratingData.sum / ratingData.count).toFixed(1))
        : null;

      // Safely handle photos array - ensure it's an array and transform URLs
      const photos = Array.isArray(service.photos) && service.photos.length > 0
        ? service.photos.map(photo => {
            const photoUrl = getPhotoUrl(req, photo);
            console.log('Most-booked service photo transformation:', {
              serviceId: service._id,
              original: photo,
              transformed: photoUrl
            });
            return photoUrl;
          }).filter(Boolean)
        : [];

      return {
        id: service._id,
        title: service.name,
        description: service.description,
        category: service.category?.name || service.category,
        subcategory: service.type?.name || service.type,
        price: service.price,
        priceType: service.priceType,
        photos: photos,
        providerId: service.provider._id,
        providerName: service.provider.name,
        providerRating: service.provider.rating || 4.5,
        serviceRating: serviceRating,
        ratingCount: ratingData ? ratingData.count : 0,
        bookingCount: bookingCountMap[serviceId] || 0,
        isAvailable: service.isActive,
        location: service.location,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      };
    });

    res.json(transformedServices);
  } catch (err) {
    console.error("Error fetching most booked services:", err);
    res.status(500).json({ message: "Could not fetch most booked services", error: err.message });
  }
});

/**
 * GET /api/services/:id - Get service by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate({
        path: "provider",
        select: "name email rating phone whatsapp",
      });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Calculate service rating from reviews
    const reviews = await Review.find({
      service: service._id,
      isActive: true,
      isApproved: true
    }).select('rating');

    const serviceRating = reviews.length > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : null;

    // Safely handle photos array - ensure it's an array and transform URLs
    const photos = Array.isArray(service.photos) && service.photos.length > 0
      ? service.photos.map(photo => getPhotoUrl(req, photo)).filter(Boolean)
      : [];

    // Transform the data to match client expectations
    const transformedService = {
      id: service._id,
      title: service.name,
      description: service.description,
      category: service.category?.name || service.category,
      subcategory: service.type?.name || service.type,
      price: service.price,
      priceType: service.priceType,
      photos: photos,
      providerId: service.provider._id,
      providerName: service.provider.name,
      providerRating: service.provider.rating || 4.5, // Provider's overall rating
      serviceRating: serviceRating, // Service-specific rating from reviews (null if no reviews)
      ratingCount: reviews.length, // Number of ratings
      isAvailable: service.isActive,
      location: service.location,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    };

    res.json(transformedService);
  } catch (err) {
    console.error("Error fetching service:", err);
    res.status(500).json({ message: "Failed to fetch service", error: err.message });
  }
});

/**
 * PUT /api/services/:id
 */
router.put("/:id", authMiddleware, upload.fields([
  { name: "photos", maxCount: 5 }, // Allow multiple photos
]), async (req, res) => {
  try {
    const svc = await Service.findOne({ _id: req.params.id, provider: req.user.userId });
    if (!svc) return res.status(404).json({ message: "Service not found" });

    const { name, category, type, description, price, isActive, priceType, location } = req.body;

    if (name !== undefined) svc.name = name;
    if (category !== undefined) svc.category = category;
    if (type !== undefined) svc.type = type;
    if (description !== undefined) svc.description = description;
    if (price !== undefined) svc.price = price;
    if (isActive !== undefined) svc.isActive = isActive;
    if (priceType !== undefined) svc.priceType = priceType;
    if (location !== undefined) svc.location = location;

    // Handle photo uploads - Cloudinary will return full URLs
    if (req.files && req.files.photos && req.files.photos.length > 0) {
      const newPhotos = req.files.photos.map(file => {
        const fileUrl = getFileUrl(file);
        console.log('📸 Service photo update upload:', {
          fieldname: file.fieldname,
          originalname: file.originalname,
          url: fileUrl,
          isCloudinary: isCloudinaryUrl(fileUrl)
        });
        return fileUrl;
      }).filter(Boolean);
      
      // Append new photos to existing ones (or replace if needed)
      svc.photos = [...(svc.photos || []), ...newPhotos];
      console.log('✅ Updated service photos:', svc.photos);
    }

    await svc.save();
    
    // Transform photos to full URLs for response
    const transformedPhotos = svc.photos.map(photo => {
      if (!photo) return null;
      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo; // Already a full URL (Cloudinary)
      }
      return getPhotoUrl(req, photo);
    }).filter(Boolean);
    
    const responseService = {
      ...svc.toObject(),
      photos: transformedPhotos
    };
    
    res.json(responseService);
  } catch (err) {
    console.error("Service update error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

/**
 * DELETE /api/services/:id
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      provider: req.user.userId,
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
router.get("/admin/services", authMiddleware, async (req, res) => {
  // Check if user is admin or superadmin
  if (!["admin", "superadmin"].includes(req.user.role)) {
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
router.put("/admin/services/:id/approve", authMiddleware, async (req, res) => {
  // Check if user is admin or superadmin
  if (!["admin", "superadmin"].includes(req.user.role)) {
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
router.put("/admin/services/:id/reject", authMiddleware, async (req, res) => {
  // Check if user is admin or superadmin
  if (!["admin", "superadmin"].includes(req.user.role)) {
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
router.delete("/admin/services/:id", authMiddleware, async (req, res) => {
  // Check if user is admin or superadmin
  if (!["admin", "superadmin"].includes(req.user.role)) {
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

/**
 * GET /api/services/top-providers - Get top rated providers
 */
router.get("/top-providers", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get all providers
    const providers = await User.find({
      role: "provider",
      isActive: true,
      isVerified: true
    }).select("name email phone whatsapp photo serviceType city location rating");

    // Get all services for these providers
    const providerIds = providers.map(p => p._id);
    const services = await Service.find({
      provider: { $in: providerIds },
      isActive: true
    }).populate("provider", "name email");

    // Get all reviews for these services
    const serviceIds = services.map(s => s._id);
    const reviews = await Review.find({
      service: { $in: serviceIds },
      isActive: true,
      isApproved: true
    }).select('service rating').populate({
      path: 'service',
      select: 'provider',
      populate: {
        path: 'provider',
        select: '_id'
      }
    });

    // Calculate average rating per provider from their service reviews
    const providerRatings = {};
    const providerServiceCounts = {};

    reviews.forEach(review => {
      const providerId = review.service?.provider?._id?.toString();
      if (providerId) {
        if (!providerRatings[providerId]) {
          providerRatings[providerId] = { sum: 0, count: 0 };
        }
        providerRatings[providerId].sum += review.rating;
        providerRatings[providerId].count += 1;
      }
    });

    // Count services per provider
    services.forEach(service => {
      const providerId = service.provider?._id?.toString();
      if (providerId) {
        providerServiceCounts[providerId] = (providerServiceCounts[providerId] || 0) + 1;
      }
    });

    // Calculate average rating and prepare provider data
    const providersWithRatings = providers.map(provider => {
      const providerId = provider._id.toString();
      const ratingData = providerRatings[providerId];
      const averageRating = ratingData && ratingData.count > 0
        ? parseFloat((ratingData.sum / ratingData.count).toFixed(1))
        : null;

      return {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        whatsapp: provider.whatsapp,
        photo: provider.photo ? getPhotoUrl(req, provider.photo) : null,
        serviceType: provider.serviceType,
        city: provider.city,
        location: provider.location,
        rating: averageRating || provider.rating || 0,
        reviewCount: ratingData ? ratingData.count : 0,
        serviceCount: providerServiceCounts[providerId] || 0
      };
    });

    // Sort by rating (highest first) and limit
    providersWithRatings.sort((a, b) => b.rating - a.rating);
    const topProviders = providersWithRatings.slice(0, limit);

    res.json(topProviders);
  } catch (err) {
    console.error("Error fetching top providers:", err);
    res.status(500).json({ message: "Could not fetch top providers", error: err.message });
  }
});

/**
 * GET /api/services/provider/:providerId - Get all services by provider ID (public)
 */
router.get("/provider/:providerId", async (req, res) => {
  try {
    const { providerId } = req.params;
    const services = await Service.find({ 
      provider: providerId,
      isActive: true 
    })
      .populate("category", "name")
      .select("_id name");

    res.json(services);
  } catch (err) {
    console.error("Error fetching provider services:", err);
    res.status(500).json({ message: "Failed to fetch provider services" });
  }
});

module.exports = router;
