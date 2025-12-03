/**
 * Checks if a URL is a Cloudinary URL
 */
const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

/**
 * Applies Cloudinary transformations for optimized image delivery
 * @param url - Cloudinary URL
 * @param options - Transformation options
 */
const applyCloudinaryTransformations = (
  url: string, 
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  } = {}
): string => {
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  // Check if URL already has transformations
  if (url.includes('/upload/')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const [base, rest] = parts;
      const restParts = rest.split('/');
      const firstPart = restParts[0];
      
      // Check if the first part after 'upload' looks like transformations
      // Transformations typically look like: w_800,h_600,c_fill,q_auto,f_auto
      const hasTransformations = firstPart.includes('_') && 
        (firstPart.includes('w_') || firstPart.includes('h_') || firstPart.includes('c_') || 
         firstPart.includes('q_') || firstPart.includes('f_') || firstPart.includes('dpr_'));
      
      // If URL already has transformations, return as-is to avoid breaking it
      if (hasTransformations) {
        return url;
      }
      
      // Build transformation string only if URL doesn't have transformations
      const transformations: string[] = [];
      
      if (options.width) transformations.push(`w_${options.width}`);
      if (options.height) transformations.push(`h_${options.height}`);
      if (options.crop) transformations.push(`c_${options.crop}`);
      if (options.quality) {
        transformations.push(`q_${options.quality}`);
      } else {
        transformations.push('q_auto'); // Auto quality by default
      }
      if (options.format) {
        transformations.push(`f_${options.format}`);
      } else {
        transformations.push('f_auto'); // Auto format by default
      }
      
      // Add device pixel ratio for responsive images
      transformations.push('dpr_auto');
      
      const transformString = transformations.join(',');
      
      // Insert transformations before the image path
      return `${base}/upload/${transformString}/${rest}`;
    }
  }
  
  return url;
};

/**
 * Normalizes image URLs to ensure they're properly formatted
 * Handles both Cloudinary URLs and local file paths
 * @param url - Image URL to normalize
 * @param options - Optional transformation options for Cloudinary images
 */
export const normalizeImageUrl = (
  url: string | undefined | null,
  options?: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  }
): string | null => {
  if (!url) return null;
  
  // Log the input URL for debugging
  if (import.meta.env.DEV) {
    console.log('🖼️  Normalizing image URL:', url);
  }
  
  // If it's already a full URL (Cloudinary or external)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Check if it's a localhost or network IP URL missing /uploads/ path
    // Pattern: http://localhost:5000/filename.jpg or http://192.168.1.100:5000/filename.jpg
    // Should be: http://localhost:5000/uploads/filename.jpg or http://192.168.1.100:5000/uploads/filename.jpg
    const isLocalDev = url.includes('localhost') || url.includes('127.0.0.1') || 
                      /^http:\/\/\d+\.\d+\.\d+\.\d+:\d+/.test(url); // Matches http://192.168.1.100:5000
    
    if (isLocalDev) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // If pathname doesn't start with /uploads/ and looks like a filename (has extension)
      if (!pathname.startsWith('/uploads/') && !pathname.startsWith('/api/') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pathname)) {
        // It's likely a filename that needs /uploads/ prefix
        const filename = pathname.startsWith('/') ? pathname.slice(1) : pathname;
        urlObj.pathname = `/uploads/${filename}`;
        console.log('Fixing local URL missing /uploads/ path:', { original: url, fixed: urlObj.toString() });
        return urlObj.toString();
      }
    }
    
    // In development ONLY, convert production URLs to current origin
    // In production, return all URLs as-is (don't modify them)
    if (import.meta.env.DEV && (url.includes('gezana-api.onrender.com') || url.includes('onrender.com'))) {
      const urlPath = url.replace(/^https?:\/\/[^/]+/, '');
      // Use the actual request origin (works for mobile on same network)
      let devUrl: string;
      if (typeof window !== 'undefined' && window.location) {
        const currentHost = window.location.hostname;
        const currentPort = window.location.port || '5000';
        const protocol = window.location.protocol;
        devUrl = `${protocol}//${currentHost}:${currentPort}${urlPath}`;
      } else {
        devUrl = `http://localhost:5000${urlPath}`;
      }
      console.log('Converting production URL to current origin (DEV ONLY):', { original: url, converted: devUrl });
      return devUrl;
    }
    
    // If it's a Cloudinary URL, only apply optimizations if options are provided
    // Otherwise return as-is to avoid breaking working URLs
    if (isCloudinaryUrl(url)) {
      // Only apply transformations if we have specific options
      // This prevents breaking URLs that are already working
      if (options && (options.width || options.height || options.crop)) {
        return applyCloudinaryTransformations(url, options);
      }
      // Return Cloudinary URL as-is if no specific transformations requested
      return url;
    }
    
    // In production, return production URLs as-is (don't log or modify)
    // In development, log for debugging
    if (import.meta.env.DEV) {
      console.log('Using external URL (not Cloudinary, not production):', url);
    }
    return url;
  }
  
  // If it's a relative path, construct full URL
  // Use the axios base URL to get the correct server URL (works for mobile)
  let baseURL: string;
  
  if (import.meta.env.DEV) {
    // In development, try to use the actual request origin
    // This works when accessing from mobile on the same network
    // If accessed via http://192.168.1.100:5173, use http://192.168.1.100:5000
    if (typeof window !== 'undefined' && window.location) {
      // Extract the host from the current page URL
      const currentHost = window.location.hostname;
      const port = '5000'; // Backend port
      // Use the same protocol as the current page
      const protocol = window.location.protocol;
      
      // If hostname is not localhost, use it (mobile device accessing via network IP)
      if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
        baseURL = `${protocol}//${currentHost}:${port}`;
        console.log('🌐 Using network IP for images (mobile-friendly):', baseURL);
      } else {
        // Desktop: use localhost
        baseURL = `${protocol}//${currentHost}:${port}`;
      }
    } else {
      // Fallback for SSR or when window is not available
      baseURL = 'http://localhost:5000';
    }
  } else {
    baseURL = 'https://gezana-api.onrender.com';
  }
  
  // Remove leading slash if present
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  
  // If it doesn't start with 'uploads/', add it
  if (!cleanUrl.startsWith('uploads/')) {
    return `${baseURL}/uploads/${cleanUrl}`;
  }
  
  return `${baseURL}/${cleanUrl}`;
};

/**
 * Handles image load errors with a fallback
 * Only uses fallback if the original URL is not the fallback itself (prevents infinite loops)
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string = '/logo correct.png') => {
  const target = e.currentTarget;
  const currentSrc = target.src;
  
  // Don't replace if we're already showing the fallback
  if (currentSrc.includes('logo correct.png') || currentSrc.includes('logo%20correct.png')) {
    return;
  }
  
  // Log the error for debugging
  console.error('❌ Image failed to load:', currentSrc);
  
  // Try to fix common URL issues before using fallback
  try {
    const urlObj = new URL(currentSrc);
    const pathname = urlObj.pathname;
    
    // If URL is missing /uploads/ path, try adding it
    if (!pathname.startsWith('/uploads/') && !pathname.startsWith('/api/') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pathname)) {
      if (!target.dataset.uploadsRetried) {
        target.dataset.uploadsRetried = 'true';
        const filename = pathname.startsWith('/') ? pathname.slice(1) : pathname;
        urlObj.pathname = `/uploads/${filename}`;
        const fixedUrl = urlObj.toString();
        console.log('🔧 Retrying with /uploads/ path:', fixedUrl);
        target.src = fixedUrl;
        return;
      }
    }
    
    // Try without /uploads/ if it was there (maybe file is in root)
    if (pathname.startsWith('/uploads/') && !target.dataset.noUploadsRetried) {
      target.dataset.noUploadsRetried = 'true';
      const filename = pathname.replace('/uploads/', '/');
      urlObj.pathname = filename;
      const fixedUrl = urlObj.toString();
      console.log('🔧 Retrying without /uploads/ path:', fixedUrl);
      target.src = fixedUrl;
      return;
    }
  } catch (err) {
    console.error('Error parsing URL in handleImageError:', err);
  }
  
  // In development, if it's a production URL, try converting to localhost
  if (import.meta.env.DEV && (currentSrc.includes('gezana-api.onrender.com') || currentSrc.includes('onrender.com'))) {
    if (!target.dataset.localhostRetried) {
      target.dataset.localhostRetried = 'true';
      const urlPath = currentSrc.replace(/^https?:\/\/[^/]+/, '');
      const localhostUrl = `http://localhost:5000${urlPath}`;
      console.log('🔧 Retrying with localhost URL:', localhostUrl);
      target.src = localhostUrl;
      return;
    }
  }
  
  // Try the original URL without transformations first (if it was a Cloudinary URL)
  if (currentSrc.includes('cloudinary.com')) {
    // Extract the original Cloudinary URL without transformations
    try {
      const urlObj = new URL(currentSrc);
      const pathParts = urlObj.pathname.split('/');
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      
      if (uploadIndex !== -1 && uploadIndex < pathParts.length - 1) {
        // Check if there are transformations (next part after 'upload')
        const afterUpload = pathParts[uploadIndex + 1];
        if (afterUpload.includes('_')) {
          // Has transformations, try without them
          const originalPath = pathParts.slice(0, uploadIndex + 1).concat(pathParts.slice(uploadIndex + 2)).join('/');
          const originalUrl = `${urlObj.protocol}//${urlObj.host}${originalPath}${urlObj.search}`;
          
          // Only try once - set a data attribute to prevent infinite retries
          if (!target.dataset.retried) {
            target.dataset.retried = 'true';
            target.src = originalUrl;
            return;
          }
        }
      }
    } catch (err) {
      // URL parsing failed, continue to fallback
    }
  }
  
  // If we've already retried or it's not a Cloudinary URL, use fallback
  if (!target.dataset.fallbackSet) {
    target.dataset.fallbackSet = 'true';
    target.src = fallbackSrc;
  }
};

/**
 * Get optimized Cloudinary URL for thumbnails
 * Returns original URL if it's not a Cloudinary URL or if transformation fails
 */
export const getThumbnailUrl = (url: string | undefined | null): string | null => {
  if (!url) return null;
  
  // If it's already a full URL (from backend), check if it needs fixing
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Check if it's missing /uploads/ path (common issue)
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // If pathname doesn't start with /uploads/ and looks like a filename (has extension)
    if (!pathname.startsWith('/uploads/') && !pathname.startsWith('/api/') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pathname)) {
      // Fix the URL by adding /uploads/
      const filename = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      urlObj.pathname = `/uploads/${filename}`;
      const fixedUrl = urlObj.toString();
      console.log('🔧 Fixed thumbnail URL (added /uploads/):', { original: url, fixed: fixedUrl });
      return fixedUrl;
    }
    
    // For Cloudinary URLs, apply transformations
    if (isCloudinaryUrl(url)) {
      return normalizeImageUrl(url, {
        width: 200,
        height: 200,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      });
    }
    
    // Return non-Cloudinary URLs as-is (already correct)
    return url;
  }
  
  // For relative paths, normalize
  return normalizeImageUrl(url, {
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};

/**
 * Get optimized Cloudinary URL for service cards
 * Returns original URL if it's not a Cloudinary URL or if transformation fails
 */
export const getCardImageUrl = (url: string | undefined | null): string | null => {
  if (!url) return null;
  
  // If it's already a full URL (from backend), check if it needs fixing
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Check if it's missing /uploads/ path (common issue)
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // If pathname doesn't start with /uploads/ and looks like a filename (has extension)
    if (!pathname.startsWith('/uploads/') && !pathname.startsWith('/api/') && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pathname)) {
      // Fix the URL by adding /uploads/
      const filename = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      urlObj.pathname = `/uploads/${filename}`;
      const fixedUrl = urlObj.toString();
      console.log('🔧 Fixed card image URL (added /uploads/):', { original: url, fixed: fixedUrl });
      return fixedUrl;
    }
    
    // For Cloudinary URLs, apply transformations
    if (isCloudinaryUrl(url)) {
      return normalizeImageUrl(url, {
        width: 800,
        height: 800,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      });
    }
    
    // Return non-Cloudinary URLs as-is (already correct)
    return url;
  }
  
  // For relative paths, normalize
  return normalizeImageUrl(url, {
    width: 800,
    height: 800,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};

/**
 * Get optimized Cloudinary URL for full-size images
 * Returns original URL if it's not a Cloudinary URL or if transformation fails
 */
export const getFullImageUrl = (url: string | undefined | null): string | null => {
  if (!url) return null;
  // For Cloudinary URLs, apply transformations
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (isCloudinaryUrl(url)) {
      return normalizeImageUrl(url, {
        width: 1200,
        height: 675,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      });
    }
    // Return non-Cloudinary URLs as-is
    return url;
  }
  // For relative paths, normalize
  return normalizeImageUrl(url, {
    width: 1200,
    height: 675,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};

