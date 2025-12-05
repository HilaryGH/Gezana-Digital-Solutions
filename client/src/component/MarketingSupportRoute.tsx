import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role: string;
  userId: string;
  exp: number;
}

const MarketingSupportRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found");
      setIsAuthorized(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("Decoded token:", decoded);
      // Allow admin, superadmin, marketing, and support roles
      if (["admin", "superadmin", "marketing", "support"].includes(decoded.role)) {
        setIsAuthorized(true);
      } else {
        console.log("Not authorized");
        setIsAuthorized(false);
      }
    } catch (err) {
      console.log("Error decoding token", err);
      setIsAuthorized(false);
    }
  }, []);

  if (isAuthorized === null) return <p>Checking access...</p>; // show while loading
  if (!isAuthorized) return <Navigate to="/login" />;

  return <>{children}</>;
};

export default MarketingSupportRoute;

