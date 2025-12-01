import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Lock } from "lucide-react"; // nice icons
import axios from "../api/axios";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "seeker" | "provider" | "admin" | "support" | "marketing" | "superadmin";
    createdAt: string;
  };
};

interface LoginFormProps {
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
  const { t } = useTranslation();
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

      // Navigate based on user role
      if (user.role === "seeker") {
        navigate("/seeker-dashboard");
      } else if (user.role === "provider") {
        navigate("/provider-dashboard");
      } else if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "support") {
        navigate("/support-dashboard");
      } else if (user.role === "marketing") {
        navigate("/marketing-dashboard");
      } else if (user.role === "superadmin") {
        navigate("/superadmin-dashboard");
      } else {
        // Fallback for unknown roles
        setError("Unknown user role. Please contact support.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
   <form
  onSubmit={handleSubmit}
  className="relative w-full"
>
  {/* Close button - only show if in modal */}
  {onClose && (
    <button
      type="button"
      onClick={onClose}
      className="absolute -top-4 -right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 shadow-md"
    >
      ✕
    </button>
  )}

  {error && (
    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
  )}

  {/* Email */}
  <div className="relative mb-4">
    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
    <input
      type="email"
      placeholder={t('common.email')}
      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-base bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
  </div>

  {/* Password */}
  <div className="relative mb-5">
    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
    <input
      type="password"
      placeholder={t('common.password')}
      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-base bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
  </div>

  {/* Forgot password */}
  <div className="text-right mb-6">
    <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
      {t('auth.forgotPassword')}
    </Link>
  </div>

  {/* Button */}
  <button
    type="submit"
    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3.5 rounded-xl font-semibold text-base hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
  >
{t('common.login')}
  </button>

  {/* Divider */}
  <div className="flex items-center my-6">
    <div className="flex-1 border-t border-gray-300"></div>
    <span className="px-4 text-gray-500 text-sm font-medium">or</span>
    <div className="flex-1 border-t border-gray-300"></div>
  </div>

  {/* Social Login Buttons */}
  <div className="space-y-3">
    <button
      type="button"
      onClick={() => handleSocialLogin("google")}
      className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
{t('auth.continueWithGoogle')}
    </button>

    <button
      type="button"
      onClick={() => handleSocialLogin("facebook")}
      className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
{t('auth.continueWithFacebook')}
    </button>
  </div>

  {/* Footer text */}
  <p className="text-center text-sm text-gray-600 mt-6">
    {t('auth.dontHaveAccount')}{" "}
    <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
      {t('common.signup')}
    </Link>
  </p>
</form>

  );
};

export default LoginForm;

