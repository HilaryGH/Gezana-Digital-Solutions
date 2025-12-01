// Helper function to check if a URL is a Cloudinary URL
const isCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

// Helper function to get file URL from multer file object
// Works with both Cloudinary and local storage
// Returns: Cloudinary URL (full URL) OR local filename (just filename, no path)
const getFileUrl = (file) => {
  if (!file) {
    console.warn('⚠️  getFileUrl: No file provided');
    return null;
  }
  
  // CLOUDINARY: CloudinaryStorage returns the full URL in file.path
  // The URL will be something like: https://res.cloudinary.com/...
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    if (isCloudinaryUrl(file.path)) {
      console.log('☁️  Cloudinary URL from file.path:', file.path);
      return file.path; // Return full Cloudinary URL
    }
    // Not Cloudinary, but still a full URL (unexpected, but handle it)
    console.warn('⚠️  Full URL detected but not Cloudinary:', file.path);
    return file.path;
  }
  
  // CLOUDINARY: Some Cloudinary configurations might use file.url
  if (file.url && (file.url.startsWith('http://') || file.url.startsWith('https://'))) {
    if (isCloudinaryUrl(file.url)) {
      console.log('☁️  Cloudinary URL from file.url:', file.url);
      return file.url; // Return full Cloudinary URL
    }
    console.warn('⚠️  Full URL in file.url but not Cloudinary:', file.url);
    return file.url;
  }
  
  // LOCAL STORAGE: Multer diskStorage returns just the filename in file.filename
  // Example: "1764607366904-photos.jpg" (no path, no URL)
  if (file.filename) {
    console.log('📁 Local filename:', file.filename);
    return file.filename; // Return just the filename (will be converted to full URL later)
  }
  
  // Debug: log the entire file object to see what properties are available
  console.error('❌ Could not extract file URL. File object properties:', Object.keys(file));
  console.error('❌ File object details:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimetype: file.mimetype,
    size: file.size,
    filename: file.filename,
    path: file.path,
    url: file.url,
    buffer: file.buffer ? 'Buffer present' : 'No buffer'
  });
  
  return null;
};

// Helper function to get file URL from stored value (database)
// Handles both Cloudinary URLs (stored as full URLs) and local filenames
const getStoredFileUrl = (req, storedValue) => {
  if (!storedValue) return null;
  
  const storedStr = String(storedValue).trim();
  if (!storedStr) return null;
  
  // CLOUDINARY: If it's already a full URL (Cloudinary or external), return as is
  if (storedStr.startsWith('http://') || storedStr.startsWith('https://')) {
    if (isCloudinaryUrl(storedStr)) {
      console.log('☁️  Returning stored Cloudinary URL:', storedStr);
      return storedStr;
    }
    // Other external URLs (shouldn't happen, but handle gracefully)
    console.warn('⚠️  Stored external URL (not Cloudinary):', storedStr);
    return storedStr;
  }
  
  // LOCAL STORAGE: It's a filename, construct the full URL
  // Always prioritize NODE_ENV check first
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Clean the filename
  let cleanFile = storedStr.replace(/\\/g, '/').replace(/^uploads\//, '').replace(/^\//, '').trim();
  
  if (!cleanFile) {
    console.warn('⚠️  Empty filename after cleaning:', storedValue);
    return null;
  }
  
  // In production, use production URL
  if (isProduction) {
    const baseUrl = 'https://gezana-api.onrender.com';
    const fullUrl = `${baseUrl}/uploads/${cleanFile}`;
    console.log('📁 Local file URL (production):', { original: storedValue, cleaned: cleanFile, fullUrl });
    return fullUrl;
  }
  
  // In development, ALWAYS use localhost
  const port = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${port}`;
  const fullUrl = `${baseUrl}/uploads/${cleanFile}`;
  console.log('📁 Local file URL (development):', { original: storedValue, cleaned: cleanFile, fullUrl });
  
  return fullUrl;
};

module.exports = {
  getFileUrl,
  getStoredFileUrl,
};

