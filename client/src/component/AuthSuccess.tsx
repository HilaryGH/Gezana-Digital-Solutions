import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // Store the token and redirect to appropriate dashboard
      localStorage.setItem("token", token);
      
      // Decode token to get user info (basic decode, no verification needed here)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem("user", JSON.stringify({
          id: payload.id,
          role: payload.role,
          name: "Social User", // We'll update this when we get full user data
          email: "social@user.com" // Placeholder
        }));

        // Redirect based on role
        setTimeout(() => {
          if (payload.role === "seeker") navigate("/seeker-dashboard");
          else if (payload.role === "provider") navigate("/provider-dashboard");
          else if (payload.role === "admin") navigate("/admin-dashboard");
          else navigate("/");
        }, 2000);
      } catch (error) {
        console.error("Error decoding token:", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Login Successful! 🎉
        </h2>
        <p className="text-gray-600 mb-4">
          You have been successfully authenticated. Redirecting you to your dashboard...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
