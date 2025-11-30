const multer = require("multer");
const path = require("path");

// Optional: Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});

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

const upload = multer({ storage, fileFilter });

module.exports = upload;
