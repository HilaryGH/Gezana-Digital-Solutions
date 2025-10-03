import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { HiSparkles } from "react-icons/hi";

const RegisterForm = () => {
  const [role, setRole] = useState<"seeker" | "provider">("seeker");
  const [providerSubRole, setProviderSubRole] = useState<string>("");
  const [businessStatus] = useState<string[]>([]);
  const [scrolled] = useState(false);
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

  const handleSeekerChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files[0]) {
      setSeekerForm({ ...seekerForm, [name]: files[0] });
    } else {
      setSeekerForm({ ...seekerForm, [name]: value });
    }
  };

  const handleProviderChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

  // Branches
  const handleBranchChange = (index: number, field: "city" | "location", value: string) => {
    const newBranches = [...providerForm.branches];
    newBranches[index][field] = value;
    setProviderForm({ ...providerForm, branches: newBranches });
  };

  const addBranch = () => {
    setProviderForm({
      ...providerForm,
      branches: [...providerForm.branches, { city: "", location: "" }],
    });
  };

  const removeBranch = (index: number) => {
    const newBranches = providerForm.branches.filter((_, i) => i !== index);
    setProviderForm({ ...providerForm, branches: newBranches });
  };

  // Banks
  const handleBankChange = (
    index: number,
    field: "bankName" | "accountNumber",
    value: string
  ) => {
    const newBanks = [...providerForm.banks];
    newBanks[index][field] = value;
    setProviderForm({ ...providerForm, banks: newBanks });
  };

  const addBank = () => {
    setProviderForm({
      ...providerForm,
      banks: [...providerForm.banks, { bankName: "", accountNumber: "" }],
    });
  };

  const removeBank = (index: number) => {
    const newBanks = providerForm.banks.filter((_, i) => i !== index);
    setProviderForm({ ...providerForm, banks: newBanks });
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
        const res = await fetch(`${axios}/auth/register`, {
          method: "POST",
          body: fd,
        });
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
          (value as File[]).forEach((file) =>
            fdProv.append("servicePhotos", file)
          );
        } else {
          fdProv.append(key, value as any);
        }
      }
    });
    fdProv.append("role", role);
    fdProv.append("subRole", providerSubRole);
    fdProv.append("businessStatus", JSON.stringify(businessStatus));

    try {
      const resProv = await fetch(`${axios}/auth/register`, {
        method: "POST",
        body: fdProv,
      });
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
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center p-6 overflow-hidden">
      {/* Bubble background */}
      {/* Bubble background */}
<div className="absolute inset-0 overflow-hidden -z-10">
  {[...Array(20)].map((_, i) => (
    <span
      key={i}
      className="bubble"
      style={{
        left: `${Math.random() * 100}%`,
        width: `${10 + Math.random() * 30}px`,
        height: `${10 + Math.random() * 30}px`,
        animationDuration: `${5 + Math.random() * 10}s`,
        animationDelay: `${Math.random() * 5}s`,
      }}
    />
  ))}
</div>


      {/* Responsive container */}
      <div className="flex flex-col md:flex-row items-start justify-center w-full max-w-6xl gap-12">
        {/* Left - Logo (fixed top) */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/3 sticky top-8">
          <div className="relative mb-3">
            <img
              src="Gezana-logo.PNG"
              alt="Gezana Logo"
              className="h-16 md:h-20 object-contain transition-transform duration-300"
            />
            <div className="absolute -top-1 -right-1">
              <HiSparkles
                className={`w-5 h-5 ${scrolled ? "text-orange-500" : "text-orange-400"} animate-pulse`}
              />
            </div>
          </div>
          <h1
            className={`text-2xl font-bold ${
              scrolled ? "text-slate-800" : "text-white"
            } transition-colors duration-300`}
          >
            Gezana
          </h1>
          <p
            className={`text-sm ${
              scrolled ? "text-orange-600" : "text-orange-400"
            } font-medium`}
          >
            Connect • Serve • Succeed
          </p>
        </div>

        {/* Right - Form */}
        <div className="relative bg-white text-black shadow-lg rounded-2xl p-8 w-full max-w-xl z-10 overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {role === "seeker"
              ? "Create Your Account"
              : "Register as Service Provider"}
          </h2>

          {/* Role Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Registering as
            </label>
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="seeker">Service Seeker</option>
              <option value="provider">Service Provider</option>
            </select>
          </div>

          {/* Provider Sub-role */}
          {role === "provider" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Provider Type
              </label>
              <select
                value={providerSubRole}
                onChange={(e) => setProviderSubRole(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Seeker Fields */}
            {role === "seeker" && (
              <>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  required
                  onChange={handleSeekerChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  required
                  onChange={handleSeekerChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  onChange={handleSeekerChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  required
                  onChange={handleSeekerChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="tel"
                  name="whatsapp"
                  placeholder="WhatsApp"
                  required
                  onChange={handleSeekerChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  name="telegram"
                  placeholder="Telegram"
                  required
                  onChange={handleSeekerChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                {/* File with Label */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Upload ID
                  </label>
                  <input
                    type="file"
                    name="idFile"
                    accept="application/pdf,image/*"
                    required
                    onChange={handleSeekerChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  onChange={handleSeekerChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  onChange={handleSeekerChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </>
            )}

            {/* Provider Fields */}
            {role === "provider" && (
              <>
                <input
                  type="text"
                  name="companyName"
                  placeholder="Company Name"
                  required
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <select
                  name="serviceType"
                  required
                  value={providerForm.serviceType}
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="" disabled>
                    Select Service Type
                  </option>
                  <option value="Home Maintenance">Home Maintenance</option>
                  <option value="Cleaning Services">Cleaning Services</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Household & Home Services">
                    Household & Home Services
                  </option>
                </select>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  required
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="tel"
                  name="alternativePhone"
                  placeholder="Alternative Phone"
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="tel"
                  name="officePhone"
                  placeholder="Office Phone"
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="tel"
                  name="whatsapp"
                  placeholder="WhatsApp"
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  name="telegram"
                  placeholder="Telegram"
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  required
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  required
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                {/* Branches Section */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Branches
                  </label>
                  {providerForm.branches.map((branch, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={branch.city}
                        onChange={(e) => handleBranchChange(idx, "city", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={branch.location}
                        onChange={(e) => handleBranchChange(idx, "location", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                      />
                      {providerForm.branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBranch(idx)}
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBranch}
                    className="text-blue-500 mt-1 text-sm"
                  >
                    + Add Branch
                  </button>
                </div>

                {/* Banks */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Bank Accounts</label>
                  {providerForm.banks.map((bank, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2">
                      <select
                        value={bank.bankName}
                        onChange={(e) => handleBankChange(idx, "bankName", e.target.value)}
                        className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select Bank</option>
                        <option value="Abay Bank">Abay Bank</option>
                        <option value="Addis International Bank">Addis International Bank</option>
                        <option value="Ahadu Bank">Ahadu Bank</option>
                        <option value="Amhara Bank">Amhara Bank</option>
                        <option value="Awash International Bank">Awash International Bank</option>
                        <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                        <option value="Berhan Bank">Berhan Bank</option>
                        <option value="Buna Bank">Buna Bank</option>
                        <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia</option>
                        <option value="Dashen Bank">Dashen Bank</option>
                        <option value="Enat Bank">Enat Bank</option>
                        <option value="Hibret Bank">Hibret Bank</option>
                        <option value="Nib Bank">Nib International Bank</option>
                        <option value="Zemen Bank">Zemen Bank</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={bank.accountNumber}
                        onChange={(e) => handleBankChange(idx, "accountNumber", e.target.value)}
                        className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                      />
                      {providerForm.banks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBank(idx)}
                          className="text-red-500 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBank}
                    className="text-blue-500 mt-1 text-sm"
                  >
                    + Add Bank Account
                  </button>
                </div>

                <input
                  type="text"
                  name="tin"
                  placeholder="TIN"
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />

                {/* File Uploads */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Upload License
                  </label>
                  <input
                    type="file"
                    name="license"
                    accept="application/pdf,image/*"
                    onChange={handleProviderChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Upload Trade Registration
                  </label>
                  <input
                    type="file"
                    name="tradeRegistration"
                    accept="application/pdf,image/*"
                    onChange={handleProviderChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Upload Service Center Photos (up to 5)
                  </label>
                  <input
                    type="file"
                    name="servicePhotos"
                    multiple
                    accept="image/*"
                    onChange={handleProviderChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Upload Intro Video (optional)
                  </label>
                  <input
                    type="file"
                    name="video"
                    accept="video/*"
                    onChange={handleProviderChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Upload Service Price List/Quotation Document (PDF)
                  </label>
                  <input
                    type="file"
                    name="priceList"
                    accept="application/pdf,image/*"
                    onChange={handleProviderChange}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                  onChange={handleProviderChange}
                  className="p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </>
            )}

            {/* Consent */}
            <div className="col-span-2 flex items-start mt-2">
              <input
                type="checkbox"
                checked={consent}
                onChange={() => setConsent(!consent)}
                className="mr-2 mt-1 accent-orange-600"
              />
              <label className="text-sm text-gray-700 leading-snug">
                I consent to the collection and processing of my personal data in
                line with data regulations as described in the{" "}
                <span className="text-orange-600 underline cursor-pointer">
                  Privacy Policy
                </span>{" "}
                &{" "}
                <span className="text-orange-600 underline cursor-pointer">
                  Merchant Service Agreement
                </span>
                .
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="col-span-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium p-2 text-sm rounded-lg hover:opacity-90 transition"
            >
              Register
            </button>

            <p className="col-span-2 text-center text-sm mt-2 text-gray-700">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-orange-600 font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

