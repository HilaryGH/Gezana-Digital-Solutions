import axios from "axios";

// Environment-aware base URL
const getBaseURL = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    // In development, try to use the actual hostname from the current page
    // This works for mobile devices on the same network
    // If accessed via http://192.168.1.100:5173, use http://192.168.1.100:5000/api
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      const port = '5000';
      
      // If hostname is not localhost, use it (mobile device accessing via network IP)
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        const protocol = window.location.protocol;
        const baseURL = `${protocol}//${hostname}:${port}/api`;
        console.log('🌐 Using network IP for API (mobile-friendly):', baseURL);
        return baseURL;
      }
    }
    
    // Fallback to localhost for desktop
    return "http://localhost:5000/api";
  }
  return "https://gezana-api.onrender.com/api"; // Production server
};

const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // 60 seconds timeout (increased for booking operations)
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token and FormData handling
instance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If FormData is being sent, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Reduced logging - only log important requests
    if (import.meta.env.DEV && (config.url?.includes('/bookings') || config.url?.includes('/user'))) {
      console.log(`🚀 Making ${config.method?.toUpperCase()} request to:`, config.url);
    }
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
instance.interceptors.response.use(
  (response) => {
    // Reduced logging - only log errors or important responses
    if (import.meta.env.DEV && (response.config.url?.includes('/bookings') || response.config.url?.includes('/user'))) {
      console.log(`✅ Response received from ${response.config.url}:`, {
        status: response.status,
        statusText: response.statusText,
      });
    }
    return response;
  },
  (error) => {
    // Always log errors
    console.error("❌ Response interceptor error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export default instance;
