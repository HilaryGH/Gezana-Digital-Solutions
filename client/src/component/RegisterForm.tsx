import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const RegisterForm = () => {
  const [role, setRole] = useState<"seeker" | "provider">("seeker");
  const [providerSubRole, setProviderSubRole] = useState<string>("");
  const [businessStatus] = useState<string[]>([]);
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
  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as typeof role);
  };

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


  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert("You must agree to the data processing terms.");
      return;
    }

    if (role === "seeker") {
      if (seekerForm.password !== seekerForm.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const fd = new FormData();
      Object.entries(seekerForm).forEach(([key, value]) => {
        if (value) fd.append(key, value as any);
      });
      fd.append("role", role);

      try {
        const res = await fetch(`${axios}/auth/register`, { method: "POST", body: fd });
        if (!res.ok) {
          const { msg } = await res.json().catch(() => ({}));
          alert(msg || "Registration failed");
          return;
        }
        alert("Account created successfully!");
        navigate("/login");
      } catch (err) {
        console.error(err);
        alert("An error occurred. Please try again.");
      }
      return;
    }

    // Provider
    if (!providerForm.companyName || !providerForm.serviceType || !providerSubRole) {
      alert("Company name, service type, and provider type are required.");
      return;
    }

    if (providerForm.password !== providerForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const fdProv = new FormData();
    Object.entries(providerForm).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        fdProv.append(key, JSON.stringify(value));
      } else if (value) {
        if (key === "servicePhotos" && Array.isArray(value)) {
          (value as File[]).forEach((file) => fdProv.append("servicePhotos", file));
        } else {
          fdProv.append(key, value as any);
        }
      }
    });
    fdProv.append("role", role);
    fdProv.append("subRole", providerSubRole);
    fdProv.append("businessStatus", JSON.stringify(businessStatus));

    try {
      const resProv = await fetch(`${axios}/auth/register`, { method: "POST", body: fdProv });
      if (!resProv.ok) {
        const { msg } = await resProv.json().catch(() => ({}));
        alert(msg || "Provider registration failed");
        return;
      }
      alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("An error occurred during registration. Please try again.");
    }
  };

  // ---------------- JSX ----------------
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* LEFT CARD */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="bg-black shadow-lg rounded-2xl p-8 w-full max-w-md">
           {/* Logo */}
  <div className="flex justify-center mb-5">
    <img
      src="Gezana-logo.PNG"
      alt="Gezana Logo"
      className="h-12 sm:h-14 object-contain"
    />
  </div>
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-100 text-xs">
            {role === "seeker" ? "Create Your Account" : "Register as Service Provider"}
          </h2>

          {/* Role Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-300">Registering as</label>
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black"
            >
              <option value="seeker">Service Seeker</option>
              <option value="provider">Service Provider</option>
            </select>
          </div>

          {/* Provider Sub-role */}
          {role === "provider" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-300">Provider Type</label>
              <select
                value={providerSubRole}
                onChange={(e) => setProviderSubRole(e.target.value)}
                className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black"
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="freelancer">Freelancer</option>
                <option value="smallBusiness">Small Business</option>
                <option value="specializedBusiness">Specialized Business</option>
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Seeker Form */}
            {role === "seeker" && (
              <>
                {/* Example for one input */}
<input
  type="text"
  name="fullName"
  placeholder="Full Name"
  required
  onChange={handleSeekerChange}
  className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs  placeholder-gray-400 bg-black"
/>

                <input type="text" name="address" placeholder="Address" required onChange={handleSeekerChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="email" name="email" placeholder="Email" required onChange={handleSeekerChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="tel" name="phone" placeholder="Phone" required onChange={handleSeekerChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="tel" name="whatsapp" placeholder="WhatsApp" required onChange={handleSeekerChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="text" name="telegram" placeholder="Telegram" required onChange={handleSeekerChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <label className="text-xs text-gray-100">ID / Passport / Yellow Card</label>
                <input type="file" name="idFile" accept="application/pdf,image/*" required onChange={handleSeekerChange} className="w-full p-1.5 border border-gray-300 rounded-lg text-gray-100 text-xs  placeholder-gray-400 bg-black" />
                <input type="password" name="password" placeholder="Password" required onChange={handleSeekerChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" required onChange={handleSeekerChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
              </>
            )}

            {/* Provider Form */}
            {role === "provider" && (
              <>
                <input type="text" name="companyName" placeholder="Company Name" required onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <select name="serviceType" required value={providerForm.serviceType} onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black">
                  <option value="" disabled>
                    Select Service Type
                  </option>
                  <option value="Home Maintenance">Home Maintenance</option>
                  <option value="Cleaning Services">Cleaning Services</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Household & Home Services">Household & Home Services</option>
                </select>
                <input type="email" name="email" placeholder="Email" required onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="tel" name="phone" placeholder="Phone" required onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="tel" name="alternativePhone" placeholder="Alternative Phone" onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="tel" name="officePhone" placeholder="Office Phone" onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="tel" name="whatsapp" placeholder="WhatsApp" onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="text" name="telegram" placeholder="Telegram" onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="text" name="city" placeholder="City" required onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="text" name="location" placeholder="Location" required onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="text" name="tin" placeholder="TIN" onChange={handleProviderChange} className="w-full p-1.5 border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />

                {/* Conditional docs */}
                {providerSubRole === "freelancer" ? (
                  <>
                    <label className="block text-sm font-medium text-gray-300">Professional Certificate</label>
                    <input type="file" name="professionalCertificate" accept="application/pdf,image/*" required onChange={handleProviderChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <label className="block text-sm font-medium text-gray-300">Profile Photo</label>
                    <input type="file" name="photo" accept="image/*" required onChange={handleProviderChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-300">License</label>
                    <input type="file" name="license" accept="application/pdf,image/*" required onChange={handleProviderChange} className="w-full p-2 border border-gray-300text-gray-100 text-xs  placeholder-gray-400 bg-black  rounded-lg focus:ring-2 focus:ring-blue-500" />
                    <label className="block text-sm font-medium text-gray-300">Trade Registration</label>
                    <input type="file" name="tradeRegistration" accept="application/pdf,image/*" required onChange={handleProviderChange} className="w-full text-gray-100 text-xs  placeholder-gray-400 bg-black p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </>
                )}

                <label className="block text-sm font-medium text-gray-300">Service Photos</label>
                <input type="file" name="servicePhotos" multiple accept="image/*" onChange={handleProviderChange} className="w-full p-2 border border-gray-300 rounded-lg text-gray-100 text-xs  placeholder-gray-400 bg-black focus:ring-2 focus:ring-blue-500" />
                <label className="block text-sm font-medium text-gray-300">Video</label>
                <input type="file" name="video" accept="video/*" onChange={handleProviderChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 text-gray-100 text-xs  placeholder-gray-400 bg-black focus:ring-blue-500" />
                <label className="block text-sm font-medium text-gray-300">Price List</label>
                <input type="file" name="priceList" accept="application/pdf,image/*" onChange={handleProviderChange} className="w-full p-2 border border-gray-300 text-gray-100 text-xs  placeholder-gray-400 bg-black rounded-lg focus:ring-2 focus:ring-blue-500" />
                <input type="password" name="password" placeholder="Password" required onChange={handleProviderChange} className="w-full p-1.5 text-gray-100 text-xs  placeholder-gray-400 bg-black border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" required onChange={handleProviderChange} className="w-full p-1.5  text-gray-100 text-xs  placeholder-gray-400 bg-black border border-gray-300 rounded-lg 
             focus:ring-2 focus:ring-blue-500 
             text-gray-100 text-xs placeholder-gray-400 bg-black" />
              </>
            )}

            {/* Consent */}
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={consent}
                onChange={() => setConsent(!consent)}
                className="mr-2 mt-1 accent-blue-600"
              />
              <label className="text-[11px] text-gray-300 leading-snug">
                I consent to the collection and processing of my personal data in line with data regulations as described in the{" "}
                <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span> &{" "}
                <span className="text-blue-600 underline cursor-pointer">Merchant Service Agreement</span>.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-gray-100 text-xs text-gray-100 text-xs font-medium p-1.5 rounded-lg hover:bg-blue-700 shadow-md transition"
            >
              Register
            </button>

            <p className="text-center text-sm mt-4 text-gray-300">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="hidden md:block w-1/2 bg-[url('/WHW.jpg')] bg-cover bg-center"></div>
    </div>
  );
};

export default RegisterForm;
