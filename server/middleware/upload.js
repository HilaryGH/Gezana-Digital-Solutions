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
  const allowedTypes = [
    "image/jpeg", 
    "image/png", 
    "image/jpg",
    "application/pdf",
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/wmv"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
