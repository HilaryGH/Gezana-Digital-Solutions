import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";

const AuthError: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message") || "Authentication failed";

  const handleRetry = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Authentication Failed 😔
        </h2>
        <p className="text-gray-600 mb-6">
          {decodeURIComponent(message)}
        </p>
        <button
          onClick={handleRetry}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default AuthError;
