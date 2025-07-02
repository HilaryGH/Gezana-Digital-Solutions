import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "seeker" | "provider" | "admin";
  createdAt: string;
};

const MyProfile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await axios.get<User>("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(res.data.name);
        setEmail(res.data.email);
        setPhone(res.data.phone || "");
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const body: any = { name, email, phone };
      if (password.trim()) body.password = password;

      await axios.put("/user/me", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("✅ Profile updated successfully");
      setPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(" ");
    return names
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen mt-12 bg-gradient-to-r from-orange-100 to-yellow-50 py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-300 to-orange-700 p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white text-orange-500 flex items-center justify-center text-2xl font-bold shadow-md">
            {getInitials(name)}
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">My Profile</h1>
            <p className="text-orange-100 text-sm">Manage your details</p>
          </div>
        </div>

        <div className="p-6 space-y-5 text-sm">
          {(error || message) && (
            <div
              className={`px-4 py-3 rounded-lg font-medium text-sm ${
                error
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {error || message}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                pattern="\+?[0-9]{7,15}"
                title="Enter a valid phone number"
                placeholder="e.g. +251912345678"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                New Password
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition transform hover:scale-105 shadow"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
