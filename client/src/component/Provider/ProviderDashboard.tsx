import ProviderNavbar from "./ProviderNavbar"; // adjust path if needed
import MyProfile from "../MyProfile";
import AddService from "./AddService";
import ServiceList from "./ServiceList";
import { useLocation } from "react-router-dom";

const ProviderDashboard = () => {
  // Use location to decide which component to show based on current route
  // Or better: use separate routes instead of conditional rendering here

  const location = useLocation();

  // Example: simple conditional rendering based on pathname (you can improve with React Router routes)
  const renderContent = () => {
    if (location.pathname === "/provider/add-service") return <AddService />;
    if (location.pathname === "/my-profile") return <MyProfile />;
    // default to service list on /provider-dashboard or unknown paths
    return <AddService />;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Navbar */}
      <ProviderNavbar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:ml-56">{renderContent()}</main>
    </div>
  );
};

export default ProviderDashboard;
