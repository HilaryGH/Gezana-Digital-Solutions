import axios from "axios";

type AxiosLikeError = {
  message: string;
  code?: string;
  response?: { status?: number; statusText?: string; data?: unknown };
  config?: { baseURL?: string; url?: string };
};

function isAxiosLikeError(e: unknown): e is AxiosLikeError {
  return typeof e === "object" && e !== null && "config" in e && "message" in e;
}

// Environment-aware base URL
const getBaseURL = () => {
  // Allow overriding via env var (recommended for production)
  const envBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (envBase && envBase.trim()) {
    return envBase.replace(/\/$/, "");
  }

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
  // Production server (fallback)
  // NOTE: keep this aligned with the deployed backend instance
  return "https://gezana-api-m8u7.onrender.com/api";
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
    const headers = Object.assign(
      {},
      config.headers ?? {}
    ) as Record<string, string | number | boolean>;
    const token = localStorage.getItem("token");
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete headers["Content-Type"];
    }
    config.headers = headers as typeof config.headers;
    
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
    if (isAxiosLikeError(error)) {
      const cfg = error.config;
      const fullUrl =
        cfg?.baseURL && cfg?.url
          ? `${String(cfg.baseURL).replace(/\/$/, "")}/${String(cfg.url).replace(/^\//, "")}`
          : cfg?.url;
      const payload = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: fullUrl,
        data: error.response?.data,
      };
      try {
        console.error("❌ API error:", JSON.stringify(payload));
      } catch {
        console.error("❌ API error:", payload.message, payload.status, fullUrl);
      }
    } else {
      console.error("❌ Response error (non-axios):", error);
    }
    return Promise.reject(error);
  }
);

export default instance;
