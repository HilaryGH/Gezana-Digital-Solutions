import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react"; // nice icons
import axios from "../api/axios";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "seeker" | "provider" | "admin";
    createdAt: string;
  };
};

interface LoginFormProps {
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (onClose) onClose();

      if (user.role === "seeker") navigate("/seeker-dashboard");
      else if (user.role === "provider") navigate("/provider-dashboard");
      else if (user.role === "admin") navigate("/admin-dashboard");
      else navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
   <form
  onSubmit={handleSubmit}
  className="relative bg-black/90 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md mx-auto"
>
  {/* Close button */}
  {onClose && (
    <button
      type="button"
      onClick={onClose}
      className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
    >
      ✕
    </button>
  )}

  {/* Logo */}
  <div className="flex justify-center mb-5">
    <img
      src="Gezana-logo.PNG"
      alt="Gezana Logo"
      className="h-12 sm:h-14 object-contain"
    />
  </div>

  <h2 className="text-xl sm:text-2xl font-bold mb-5 text-center text-gray-200">
    Welcome Back 👋
  </h2>

  {error && (
    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
  )}

  {/* Email */}
  <div className="relative mb-4">
    <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
    <input
      type="email"
      placeholder="Email address"
      className="w-full pl-10 pr-3 py-2.5 border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
  </div>

  {/* Password */}
  <div className="relative mb-5">
    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
    <input
      type="password"
      placeholder="Password"
      className="w-full pl-10 pr-3 py-2.5 border rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
  </div>

  {/* Forgot password */}
  <div className="text-right mb-3">
    <a href="#" className="text-xs sm:text-sm text-orange-600 hover:underline">
      Forgot password?
    </a>
  </div>

  {/* Button */}
  <button
    type="submit"
    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 sm:py-3 rounded-md font-semibold text-sm sm:text-base hover:from-orange-600 hover:to-orange-700 transition shadow-md"
  >
    Login
  </button>

  {/* Footer text */}
  <p className="text-center text-xs sm:text-sm text-gray-400 mt-4">
    Don’t have an account?{" "}
    <a href="/signup" className="text-orange-500 font-medium hover:underline">
      Sign up
    </a>
  </p>
</form>

  );
};

export default LoginForm;

