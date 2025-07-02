import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  onClose?: () => void; // callback to close modal
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

      // Save token and user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Close modal if provided
      if (onClose) onClose();

      // Redirect based on user role
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
      className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mb-6 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full bg-orange text-white py-3 rounded-md hover:bg-orange-600 transition"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
