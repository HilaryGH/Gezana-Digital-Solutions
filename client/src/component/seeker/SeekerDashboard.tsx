import { useEffect, useState } from "react";
import IndividualSeekerDashboard from "./IndividualSeekerDashboard";
import ServiceSeekerDashboard from "./ServiceSeekerDashboard";
import axios from "../../api/axios";
import SeekerNavbar from "./SeekerNavbar";

const SeekerDashboard = () => {
  const [seekerType, setSeekerType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: string;
    seekerType?: string;
  }

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<UserResponse>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSeekerType(res.data.seekerType ?? null);
        localStorage.setItem("name", res.data.name); // Store name for avatar
      } catch (error) {
        console.error("Failed to fetch user", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserType();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-gray-700 text-lg font-medium">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <SeekerNavbar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Dashboard Content */}
      <div className="pt-6 md:pl-56 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
            {seekerType === "individual" && (
              <IndividualSeekerDashboard 
                activeSection={activeSection} 
                onSectionChange={setActiveSection} 
              />
            )}
            {seekerType === "service" && <ServiceSeekerDashboard />}
            {!seekerType && (
              <div className="text-center text-red-600 font-semibold">
                Unknown seeker type. Please contact support.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;
