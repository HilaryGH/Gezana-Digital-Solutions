const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'homehub', // Folder in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'mp4', 'avi', 'mov', 'wmv'],
      transformation: [
        { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }, // Optimize images
      ],
      public_id: `${Date.now()}-${file.fieldname}`, // Unique public ID
    };
  },
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'homehub') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto', // Auto-detect image, video, or raw
    });
    return result.secure_url; // Return the Cloudinary URL
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    
    // Get the part after 'upload' and before the file extension
    const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.split('.')[0];
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  storage,
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
};

