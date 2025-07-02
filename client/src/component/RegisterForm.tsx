import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "seeker", // seeker by default
    phone: "", // <-- added phone here
  });
  interface RegisterFormProps {
    onSuccess: () => void;
  }
  const [seekerType, setSeekerType] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.role === "seeker" && !seekerType) {
      setError("Please select a seeker type");
      return;
    }

    // Basic phone validation (optional)
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    try {
      const requestBody: any = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone, // <-- send phone to backend
      };

      if (form.role === "seeker") {
        requestBody.seekerType = seekerType;
      }

      await axios.post("/auth/register", requestBody);

      alert("Registration successful ✅");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        className="w-full mb-4 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange"
        value={form.name}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full mb-4 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange"
        value={form.email}
        onChange={handleChange}
        required
      />

      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        className="w-full mb-4 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange"
        value={form.phone}
        onChange={handleChange}
        pattern="\+?[0-9]{7,15}"
        title="Phone number should be 7 to 15 digits and may start with +"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full mb-4 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange"
        value={form.password}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        className="w-full mb-4 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange"
        value={form.confirmPassword}
        onChange={handleChange}
        required
      />

      <div className="mb-4">
        <label className="block mb-1 font-medium">Register As</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange"
        >
          <option value="seeker">Service Seeker</option>
          <option value="provider">Service Provider</option>
        </select>
      </div>

      {form.role === "seeker" && (
        <div className="mb-6">
          <label className="block mb-1 font-medium">Seeker Type</label>
          <select
            value={seekerType}
            onChange={(e) => setSeekerType(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange"
            required
          >
            <option value="">Select Seeker Type</option>
            <option value="individual">Individual</option>
            <option value="service">Service</option>
          </select>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-orange text-white py-3 rounded-md hover:bg-orange-600 transition"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;
