import axios from "axios";

// Environment-aware base URL
const getBaseURL = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return "http://localhost:5000/api"; // Local development server
  }
  return "https://gezana-api.onrender.com/api"; // Production server
};

const instance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging
instance.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to:`, config.url);
    console.log("Request config:", {
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: config.headers,
    });
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
    console.log(`✅ Response received from ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ Response interceptor error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });
    return Promise.reject(error);
  }
);

export default instance;
