import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

// Type definitions
interface RegistrationResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}


const RegisterForm = () => {
  const [role, setRole] = useState<"seeker" | "provider">("seeker");
  const [providerSubRole, setProviderSubRole] = useState<string>("");
  const [businessStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [seekerForm, setSeekerForm] = useState({
    fullName: "",
    address: "",
    email: "",
    phone: "",
    whatsapp: "",
    telegram: "",
    password: "",
    confirmPassword: "",
    idFile: null as File | null,
  });

  const [providerForm, setProviderForm] = useState({
    companyName: "",
    serviceType: "",
    email: "",
    phone: "",
    alternativePhone: "",
    officePhone: "",
    whatsapp: "",
    telegram: "",
    city: "",
    location: "",
    tin: "",
    gender: "",
    femaleLedOrOwned: "",
    branches: [{ city: "", location: "" }],
    banks: [{ bankName: "", accountNumber: "" }],
    password: "",
    confirmPassword: "",
    license: null as File | null,
    tradeRegistration: null as File | null,
    professionalCertificate: null as File | null,
    photo: null as File | null,
    servicePhotos: [] as File[],
    video: null as File | null,
    priceList: null as File | null,
  });

  const [consent, setConsent] = useState(false);

  // ---------------- HANDLERS ----------------

  const handleSeekerChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setSeekerForm({ ...seekerForm, [name]: files[0] });
    } else {
      setSeekerForm({ ...seekerForm, [name]: value });
    }
  };

  const handleProviderChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files.length > 0) {
      if (name === "servicePhotos") {
        setProviderForm({ ...providerForm, servicePhotos: Array.from(files) });
      } else {
        setProviderForm({ ...providerForm, [name]: files[0] });
      }
    } else {
      setProviderForm({ ...providerForm, [name]: value });
    }
  };

  // ---------------- NETWORK TEST ----------------
  const testNetworkConnection = async () => {
    try {
      console.log("🔍 Testing network connectivity...");
      
      // Test the actual API endpoint that will be used for registration
      const response = await axios.get("/auth/health", {
        timeout: 10000, // 10 second timeout
      });
      
      console.log("✅ Network test successful:", response.status);
      return true;
    } catch (error) {
      console.error("❌ Network test failed:", error);
      
      // If the health endpoint fails, try a simple connectivity test
      try {
        console.log("🔍 Trying alternative connectivity test...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch("https://gezana-api-m8u7.onrender.com/", {
          method: "GET",
          mode: "cors",
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log("✅ Alternative connectivity test successful:", response.status);
        return true;
      } catch (altError) {
        console.error("❌ Alternative connectivity test also failed:", altError);
        return false;
      }
    }
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Test network connectivity first
    const isNetworkOk = await testNetworkConnection();
    if (!isNetworkOk) {
      setError("Network connection test failed. Please check your internet connection and try again.");
      setIsLoading(false);
      return;
    }

    if (!consent) {
      setError("You must agree to the data processing terms.");
      setIsLoading(false);
      return;
    }

    try {
    if (role === "seeker") {
      if (seekerForm.password !== seekerForm.confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
        return;
      }

        const formData = new FormData();
      Object.entries(seekerForm).forEach(([key, value]) => {
          if (value) formData.append(key, value as any);
        });
        formData.append("role", role);

        const response = await axios.post<RegistrationResponse>("/auth/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.message) {
          alert("Account created successfully! Please login to continue.");
          navigate("/login");
        }
      } else {
        // Provider registration
        if (!providerForm.companyName || !providerForm.serviceType || !providerSubRole) {
          setError("Company name, service type, and provider type are required.");
          setIsLoading(false);
      return;
    }

    if (providerForm.password !== providerForm.confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
      return;
    }

        const formData = new FormData();
    Object.entries(providerForm).forEach(([key, value]) => {
      if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
      } else if (value) {
        if (key === "servicePhotos" && Array.isArray(value)) {
              (value as File[]).forEach((file) => formData.append("servicePhotos", file));
        } else {
              formData.append(key, value as any);
            }
          }
        });
        formData.append("role", role);
        formData.append("subRole", providerSubRole);
        formData.append("businessStatus", JSON.stringify(businessStatus));

        const response = await axios.post<RegistrationResponse>("/auth/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.message) {
          alert("Account created successfully! Please login to continue.");
          navigate("/login");
        }
      }
    } catch (err: any) {
      // Enhanced error logging for debugging
      console.error("=== REGISTRATION ERROR DETAILS ===");
      console.error("Full error object:", err);
      console.error("Error message:", err.message);
      console.error("Error code:", err.code);
      console.error("Error response status:", err.response?.status);
      console.error("Error response data:", err.response?.data);
      console.error("Error response headers:", err.response?.headers);
      console.error("Request config:", err.config);
      console.error("Network error details:", err.request);
      console.error("===================================");
      
      let errorMessage = "An error occurred during registration. Please try again.";
      
      // Handle different types of errors
      if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = "Unable to connect to the server. Please try again later.";
      } else if (err.code === 'TIMEOUT' || err.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please check your connection and try again.";
      } else if (err.response?.status === 0) {
        errorMessage = "Network error: Unable to reach the server. Please check your connection.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error occurred. Please try again later.";
      } else if (err.response?.status === 404) {
        errorMessage = "Registration service not found. Please contact support.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- JSX ----------------
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center p-4 sm:p-6 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}></div>
        </div>
      </div>

      {/* Back to home button */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors z-10 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Logo Header */}
      <div className="my-6 sm:my-8 z-10">
        <img
          src="/logo correct.png"
          alt="HomeHub Logo"
          className="h-16 sm:h-20 object-contain"
        />
      </div>

      {/* Form Card */}
      <div className="relative w-full max-w-2xl z-10 mb-8">
        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-poppins">
          {role === "seeker" ? "Create Your Account" : "Register as Service Provider"}
        </h2>
            <p className="text-blue-100 mt-2 text-sm sm:text-base">
              {role === "seeker" 
                ? "Join thousands of satisfied customers" 
                : "Start your service business journey with us"
              }
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <div className="text-red-600 mr-3">⚠️</div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

        {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-700 font-inter">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("seeker")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 font-medium ${
                    role === "seeker"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-25"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👤</div>
                    <div className="text-sm font-semibold">Service Seeker</div>
                    <div className="text-xs text-gray-500 mt-1">Find services</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("provider")}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 font-medium ${
                    role === "provider"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-25"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏢</div>
                    <div className="text-sm font-semibold">Service Provider</div>
                    <div className="text-xs text-gray-500 mt-1">Offer services</div>
                  </div>
                </button>
              </div>
        </div>

        {/* Provider Sub-role */}
        {role === "provider" && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-700 font-inter">
                  Provider Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "freelancer", label: "Freelancer", icon: "💼", desc: "Individual professional" },
                    { value: "smallBusiness", label: "Small Business", icon: "🏪", desc: "Local business" },
                    { value: "specializedBusiness", label: "Specialized", icon: "🏭", desc: "Large enterprise" }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setProviderSubRole(type.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        providerSubRole === type.value
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-25"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="text-sm font-semibold">{type.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
          </div>
        )}

        {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seeker Fields */}
          {role === "seeker" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 font-inter">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        name="fullName" 
                        placeholder="Enter your full name" 
                        required 
                        onChange={handleSeekerChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 font-inter">
                        Email Address *
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="your.email@example.com" 
                        required 
                        onChange={handleSeekerChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 font-inter">
                      Address *
                    </label>
                    <input 
                      type="text" 
                      name="address" 
                      placeholder="Enter your complete address" 
                      required 
                      onChange={handleSeekerChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 font-inter">
                        Phone *
                      </label>
                      <input 
                        type="tel" 
                        name="phone" 
                        placeholder="+251 9X XXX XXXX" 
                        required 
                        onChange={handleSeekerChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 font-inter">
                        WhatsApp
                      </label>
                      <input 
                        type="tel" 
                        name="whatsapp" 
                        placeholder="+251 9X XXX XXXX" 
                        onChange={handleSeekerChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 font-inter">
                        Telegram
                      </label>
                      <input 
                        type="text" 
                        name="telegram" 
                        placeholder="@username" 
                        onChange={handleSeekerChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 font-inter">
                      Upload ID Document *
                    </label>
                    <div className="relative">
                      <input 
                        type="file" 
                        name="idFile" 
                        accept="application/pdf,image/*" 
                        required 
                        onChange={handleSeekerChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                      />
                    </div>
                    <p className="text-xs text-gray-500">Accepted formats: PDF, JPG, PNG (Max 5MB)</p>
              </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 font-inter">
                        Password *
                      </label>
                      <input 
                        type="password" 
                        name="password" 
                        placeholder="Create a strong password" 
                        required 
                        onChange={handleSeekerChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 font-inter">
                        Confirm Password *
                      </label>
                      <input 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="Confirm your password" 
                        required 
                        onChange={handleSeekerChange} 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                      />
                    </div>
                  </div>
                </div>
          )}

          {/* Provider Fields */}
          {role === "provider" && (
                <div className="space-y-6">
                  {/* Company Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-25 p-4 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 font-poppins">
                      {providerSubRole === "freelancer" ? "Personal Information" : "Company Information"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          {providerSubRole === "freelancer" ? "Full Name *" : "Company Name *"}
                        </label>
                        <input 
                          type="text" 
                          name="companyName" 
                          placeholder={providerSubRole === "freelancer" ? "Enter your full name" : "Enter company name"}
                          required 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          Service Type *
                        </label>
                        <select 
                          name="serviceType" 
                          required 
                          value={providerForm.serviceType} 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter"
                        >
                <option value="" disabled>Select Service Type</option>
                <option value="Home Maintenance">Home Maintenance</option>
                <option value="Cleaning Services">Cleaning Services</option>
                <option value="Appliance Repair">Appliance Repair</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Household & Home Services">Household & Home Services</option>
              </select>
                      </div>
                      {/* Gender field for Freelancer */}
                      {providerSubRole === "freelancer" && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 font-inter">
                            Gender *
                          </label>
                          <select 
                            name="gender" 
                            required 
                            value={providerForm.gender} 
                            onChange={handleProviderChange} 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter"
                          >
                            <option value="" disabled>Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                      )}
                      {/* Female-led/Owned field for Small Business & Specialized */}
                      {(providerSubRole === "smallBusiness" || providerSubRole === "specializedBusiness") && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 font-inter">
                            Business Type *
                          </label>
                          <select 
                            name="femaleLedOrOwned" 
                            required 
                            value={providerForm.femaleLedOrOwned} 
                            onChange={handleProviderChange} 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter"
                          >
                            <option value="" disabled>Select Business Type</option>
                            <option value="female-led">Female Led</option>
                            <option value="female-owned">Female Owned</option>
                            <option value="non-female">Non Female</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-25 p-4 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 font-poppins">Contact Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          Email Address *
                        </label>
                        <input 
                          type="email" 
                          name="email" 
                          placeholder="company@example.com" 
                          required 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          Primary Phone *
                        </label>
                        <input 
                          type="tel" 
                          name="phone" 
                          placeholder="+251 9X XXX XXXX" 
                          required 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          Alternative Phone
                        </label>
                        <input 
                          type="tel" 
                          name="alternativePhone" 
                          placeholder="+251 9X XXX XXXX" 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                        />
                      </div>
                      {(providerSubRole === "smallBusiness" || providerSubRole === "specializedBusiness") && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 font-inter">
                            Office Phone
                          </label>
                          <input 
                            type="tel" 
                            name="officePhone" 
                            placeholder="+251 1X XXX XXXX" 
                            onChange={handleProviderChange} 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          WhatsApp
                        </label>
                        <input 
                          type="tel" 
                          name="whatsapp" 
                          placeholder="+251 9X XXX XXXX" 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          Telegram
                        </label>
                        <input 
                          type="text" 
                          name="telegram" 
                          placeholder="@company_username" 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="bg-gradient-to-r from-green-50 to-green-25 p-4 rounded-xl border border-green-100">
                    <h3 className="text-lg font-semibold text-green-800 mb-4 font-poppins">Location Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          City *
                        </label>
                        <input 
                          type="text" 
                          name="city" 
                          placeholder="Addis Ababa" 
                          required 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          Location *
                        </label>
                        <input 
                          type="text" 
                          name="location" 
                          placeholder="Bole, Kazanchis" 
                          required 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                        />
                      </div>
                      {(providerSubRole === "smallBusiness" || providerSubRole === "specializedBusiness") && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 font-inter">
                            TIN Number
                          </label>
                          <input 
                            type="text" 
                            name="tin" 
                            placeholder="1234567890" 
                            onChange={handleProviderChange} 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-25 p-4 rounded-xl border border-purple-100">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4 font-poppins">Required Documents</h3>
                    <div className="space-y-4">
                      {/* For Freelancers: Professional Certificate */}
                      {providerSubRole === "freelancer" && (
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 font-inter">
                            Professional Certificate *
                          </label>
                          <input 
                            type="file" 
                            name="professionalCertificate" 
                            accept="application/pdf,image/*" 
                            required
                            onChange={handleProviderChange} 
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                          />
                          <p className="text-xs text-gray-500">Upload your professional certificate or credentials</p>
                        </div>
                      )}

                      {/* For Small/Specialized Business: Business License and Trade Registration */}
                      {(providerSubRole === "smallBusiness" || providerSubRole === "specializedBusiness") && (
                        <>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 font-inter">
                              Business License *
                            </label>
                            <input 
                              type="file" 
                              name="license" 
                              accept="application/pdf,image/*" 
                              required
                              onChange={handleProviderChange} 
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                            />
                            <p className="text-xs text-gray-500">Upload your business license document</p>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 font-inter">
                              Trade Registration *
                            </label>
                            <input 
                              type="file" 
                              name="tradeRegistration" 
                              accept="application/pdf,image/*" 
                              required
                              onChange={handleProviderChange} 
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                            />
                            <p className="text-xs text-gray-500">Upload your trade registration certificate</p>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 font-inter">
                              Professional Certificate (Optional)
                            </label>
                            <input 
                              type="file" 
                              name="professionalCertificate" 
                              accept="application/pdf,image/*" 
                              onChange={handleProviderChange} 
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                            />
                            <p className="text-xs text-gray-500">Upload professional certificates if applicable</p>
                          </div>
                        </>
                      )}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          {providerSubRole === "freelancer" ? "Work/Portfolio Photos (up to 5)" : "Service Center Photos (up to 5)"}
                        </label>
                        <input 
                          type="file" 
                          name="servicePhotos" 
                          multiple 
                          accept="image/*" 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        />
                        <p className="text-xs text-gray-500">
                          {providerSubRole === "freelancer" ? "Upload photos of your previous work or portfolio" : "Upload photos of your service center/facility"}
                        </p>
              </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          Introduction Video (Optional)
                        </label>
                        <input 
                          type="file" 
                          name="video" 
                          accept="video/*" 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        />
                        <p className="text-xs text-gray-500">Upload a short video introducing your services</p>
              </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          Service Price List/Quotation Document
                        </label>
                        <input 
                          type="file" 
                          name="priceList" 
                          accept="application/pdf,image/*" 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                        />
                        <p className="text-xs text-gray-500">Upload your service pricing document (PDF preferred)</p>
              </div>
              </div>
              </div>

                  {/* Password Section */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-25 p-4 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 font-poppins">Account Security</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          Password *
                        </label>
                        <input 
                          type="password" 
                          name="password" 
                          placeholder="Create a strong password" 
                          required 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 font-inter">
                          Confirm Password *
                        </label>
                        <input 
                          type="password" 
                          name="confirmPassword" 
                          placeholder="Confirm your password" 
                          required 
                          onChange={handleProviderChange} 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white font-inter" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
          )}

          {/* Consent */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-25 p-4 rounded-xl border border-blue-100">
                <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={() => setConsent(!consent)}
                    className="mt-1 w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 accent-blue-600"
            />
                  <label className="text-sm text-gray-700 leading-relaxed font-inter">
              I consent to the collection and processing of my personal data in line with data regulations as described in the{" "}
                    <span className="text-blue-600 underline cursor-pointer hover:text-blue-700 font-semibold">Privacy Policy</span> &{" "}
                    <span className="text-blue-600 underline cursor-pointer hover:text-blue-700 font-semibold">Merchant Service Agreement</span>.
            </label>
                </div>
          </div>

              {/* Submit Button */}
              <div className="pt-4">
          <button
            type="submit"
                  disabled={isLoading}
                  className={`w-full font-semibold py-4 px-6 rounded-xl transform transition-all duration-300 shadow-lg font-poppins text-lg ${
                    isLoading
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] hover:shadow-xl"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {role === "seeker" ? "Creating Account..." : "Registering Provider..."}
                    </div>
                  ) : (
                    role === "seeker" ? "Create Account" : "Register as Provider"
                  )}
          </button>
              </div>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-gray-600 font-inter">
            Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors duration-200"
                  >
                    Sign In
            </Link>
          </p>
              </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;


