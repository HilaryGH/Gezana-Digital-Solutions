const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

// Check if Cloudinary is configured
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

let storage;
let upload;

if (useCloudinary) {
  // Use Cloudinary storage
  // When Cloudinary is used, multer returns file.path with full Cloudinary URL
  // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/homehub/1764607366904-photos.jpg
  const { storage: cloudinaryStorage } = require("../config/cloudinary");
  storage = cloudinaryStorage;
  console.log("✅ Using Cloudinary for file uploads");
  console.log("   → Files will be stored in Cloudinary and return full URLs");
} else {
  // Fallback to local disk storage
  // When local storage is used, multer returns file.filename with just the filename
  // Example: "1764607366904-photos.jpg" (stored in server/uploads/ directory)
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir); // Use absolute path
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, Date.now() + "-" + file.fieldname + ext);
    },
  });
  console.log("⚠️  Cloudinary not configured, using local storage");
  console.log(`   → Files will be stored in: ${uploadsDir}`);
  console.log("   → Files will return just the filename (converted to full URL by getPhotoUrl)");
}

// File filter (allow images, pdfs, and videos)
const fileFilter = (req, file, cb) => {
  console.log("File filter - checking file:", {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });
  
  const allowedTypes = [
    "image/jpeg", 
    "image/png", 
    "image/jpg",
    "image/gif",
    "image/webp",
    "application/pdf",
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/wmv"
  ];
  
  // Also check file extension as fallback
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.mp4', '.avi', '.mov', '.wmv'];
  
  // Check MIME type first
  if (allowedTypes.includes(file.mimetype)) {
    console.log("File accepted by MIME type:", file.mimetype);
    cb(null, true);
  } 
  // Fallback to extension check
  else if (allowedExtensions.includes(ext)) {
    console.log("File accepted by extension:", ext);
    cb(null, true);
  } 
  else {
    console.error("File rejected - MIME type:", file.mimetype, "Extension:", ext);
    cb(new Error(`Unsupported file format. Allowed types: ${allowedTypes.join(', ')} or extensions: ${allowedExtensions.join(', ')}`), false);
  }
};

upload = multer({ storage, fileFilter });

module.exports = upload;
