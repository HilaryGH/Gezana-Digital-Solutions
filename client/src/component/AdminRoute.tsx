import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role: string;
  userId: string;
  exp: number;
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found");
      setIsAdmin(false);
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("Decoded token:", decoded);
      if (decoded.role === "admin") {
        setIsAdmin(true);
      } else {
        console.log("Not admin");
        setIsAdmin(false);
      }
    } catch (err) {
      console.log("Error decoding token", err);
      setIsAdmin(false);
    }
  }, []);

  if (isAdmin === null) return <p>Checking access...</p>; // show while loading
  if (!isAdmin) return <Navigate to="/login" />;

  return <>{children}</>;
};

export default AdminRoute;
