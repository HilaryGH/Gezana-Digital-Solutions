import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

type User = {
  name: string;
  email: string;
  role: "seeker" | "provider" | "admin" | "superadmin" | "support" | "marketing";
  createdAt: string;
};

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get<User>("/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { role } = res.data;

        if (role === "seeker") navigate("/seeker-dashboard");
        else if (role === "provider") navigate("/provider-dashboard");
        else if (role === "admin") navigate("/admin-dashboard");
        else if (role === "superadmin") navigate("/superadmin-dashboard");
        else if (role === "support") navigate("/support-dashboard");
        else if (role === "marketing") navigate("/marketing-dashboard");
        else navigate("/login");
      } catch {
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  return <p className="text-center mt-20">Redirecting to your dashboard...</p>;
};

export default Dashboard;
