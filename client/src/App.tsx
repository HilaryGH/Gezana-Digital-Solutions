import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./component/Navbar";
import Footer from "./component/Footer";

import Home from "./component/Home";
import AboutPage from "./component/Pages/AboutPage";
import ServicesPage from "./component/Pages/ServicesPage";
import ContactPage from "./component/Pages/ContactPage";
import LoginForm from "./component/LoginForm";
import RegisterForm from "./component/RegisterForm";
import CancelBooking from "./component/seeker/CancelBooking";
import SeekerDashboard from "./component/seeker/SeekerDashboard";
import ProviderDashboard from "./component/Provider/ProviderDashboard";
import AdminDashboard from "./component/Admin/AdminDashboard";
import AdminRoute from "./component/AdminRoute";
import MyProfile from "./component/MyProfile";
import LoyaltyPoints from "./component/LoyaltyPoints";
import AddService from "./component/Provider/AddService";
import MyBookings from "./component/seeker/MyBookings";
import Users from "./component/Admin/Users";
import AdminBookings from "./component/Admin/AdminBookings";
import AdminServices from "./component/Admin/AdminServices";
import ProvidersDirectory from "./component/Provider/ProvidersDirectory";
import ProviderBookings from "./component/Provider/ProviderBookings";
import PaymentSuccess from "./component/PaymentSuccess";
import BookServiceWithPayment from "./component/seeker/BookServiceWithPayment";
import ServiceList from "./component/Provider/ServiceList";
import AdminProvidersList from "./component/Admin/AdminProvidersList";

function AppContent() {
  const location = useLocation();

  // Routes where Navbar should NOT be shown
  const noNavbarRoutes = [
    "/signup",
    "/login",
    "/seeker-dashboard",
    "/provider-dashboard",
    "/admin-dashboard",
    "/provider/add-service",
    "/admin/user",
    "/admin/bookings",
    "/admin/services",
    "/provider/bookings",
    "/provider/service-lists",
  ];

  const isNoNavbarRoute = noNavbarRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  const isHomePage = location.pathname === "/";
  const isAboutPage = location.pathname === "/about";
  const isServicesPage = location.pathname === "/services";
  const isContactPage = location.pathname === "/contact";

  return (
    <>
      {/* Show Navbar only if current path is NOT in noNavbarRoutes */}
      {!isNoNavbarRoute && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<RegisterForm />} />
        <Route path="/providers" element={<ProvidersDirectory />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        {/* Seeker Routes */}
        <Route path="/book-service" element={<BookServiceWithPayment />} />
        <Route path="/cancel-booking" element={<CancelBooking />} />
        <Route path="/seeker-dashboard" element={<SeekerDashboard />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/loyalty" element={<LoyaltyPoints />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        {/* Provider Routes */}
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/add-service" element={<AddService />} />
        <Route path="/provider/bookings" element={<ProviderBookings />} />
        <Route path="/provider/service-lists" element={<ServiceList />} />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/admin/user" element={<Users />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/providers-list" element={<AdminProvidersList />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>

      {/* Show Footer on home page, about page, services page, and contact page */}
      {(isHomePage || isAboutPage || isServicesPage || isContactPage) && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
