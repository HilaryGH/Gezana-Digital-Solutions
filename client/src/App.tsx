import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./component/Navbar";
import Footer from "./component/Footer";

import Home from "./component/Home";
import AboutPage from "./component/Pages/AboutPage";
import ServicesPage from "./component/Pages/ServicesPage";
import ContactPage from "./component/Pages/ContactPage";
import LoginPage from "./component/Pages/LoginPage";
import ForgotPassword from "./component/Pages/ForgotPassword";
import ResetPassword from "./component/Pages/ResetPassword";
import SupportForm from "./component/Pages/SupportForm";
import DiasporaCommunityForm from "./component/Pages/DiasporaCommunityForm";
import InvestPartnerForm from "./component/Pages/InvestPartnerForm";
import WomenInitiativesForm from "./component/Pages/WomenInitiativesForm";
import CommunityPage from "./component/Pages/CommunityPage";
import RegisterForm from "./component/RegisterForm";
import CancelBooking from "./component/seeker/CancelBooking";
import SeekerDashboard from "./component/seeker/SeekerDashboard";
import ProviderDashboard from "./component/Provider/ProviderDashboard";
import AdminDashboard from "./component/Admin/AdminDashboard";
import AdminRoute from "./component/AdminRoute";
import MarketingSupportRoute from "./component/MarketingSupportRoute";
import CustomerSupportDashboard from "./component/Support/CustomerSupportDashboard";
import MarketingDashboard from "./component/Marketing/MarketingDashboard";
import SuperadminDashboard from "./component/Superadmin/SuperadminDashboard";
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
import AdminTeamMembers from "./component/Admin/AdminTeamMembers";
import AdminTestimonials from "./component/Admin/AdminTestimonials";
import AdminPromotionalBanners from "./component/Admin/AdminPromotionalBanners";
import AdminInvestments from "./component/Admin/AdminInvestments";
import AdminWomenInitiatives from "./component/Admin/AdminWomenInitiatives";
import AdminJobs from "./component/Admin/AdminJobs";
import PremiumMemberships from "./component/Admin/PremiumMemberships";
import AdminReferrals from "./component/Admin/AdminReferrals";
import SubmitTestimonial from "./component/Pages/SubmitTestimonial";
import ServiceDetails from "./component/ServiceDetails";
import ProviderDetails from "./component/ProviderDetails";
import PaymentPage from "./component/PaymentPage";
import AuthSuccess from "./component/AuthSuccess";
import AuthError from "./component/AuthError";
import PremiumMembershipPage from "./component/Pages/PremiumMembershipPage";
import { LanguageProvider } from "./contexts/LanguageContext";

function AppContent() {
  const location = useLocation();

  // Routes where Navbar should NOT be shown
const noNavbarRoutes = [
    "/signup",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/support",
    "/diaspora",
    "/auth/success",
    "/auth/error",
    "/seeker-dashboard",
    "/provider-dashboard",
    "/admin-dashboard",
    "/support-dashboard",
    "/marketing-dashboard",
    "/superadmin-dashboard",
    "/provider/add-service",
    "/admin/user",
    "/admin/bookings",
    "/admin/services",
    "/admin/team-members",
    "/admin/testimonials",
    "/admin/promotional-banners",
    "/admin/investments",
    "/admin/women-initiatives",
    "/admin/referrals",
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
        <Route path="/service/:id" element={<ServiceDetails />} />
        <Route path="/provider/:providerId/details" element={<ProviderDetails />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/support" element={<SupportForm />} />
        <Route path="/diaspora" element={<DiasporaCommunityForm />} />
        <Route path="/invest-partner" element={<InvestPartnerForm />} />
        <Route path="/women-initiatives" element={<WomenInitiativesForm />} />
        <Route path="/women-initiative" element={<WomenInitiativesForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<RegisterForm />} />
        <Route path="/providers" element={<ProvidersDirectory />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/submit-testimonial" element={<SubmitTestimonial />} />
        <Route path="/premium-membership" element={<PremiumMembershipPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/auth/error" element={<AuthError />} />

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
        <Route 
          path="/provider/special-offers" 
          element={<Navigate to="/provider-dashboard" state={{ showSpecialOffers: true }} replace />} 
        />

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
        <Route path="/admin/team-members" element={<AdminTeamMembers />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route 
          path="/admin/promotional-banners" 
          element={
            <MarketingSupportRoute>
              <AdminPromotionalBanners />
            </MarketingSupportRoute>
          } 
        />
        <Route path="/admin/investments" element={<AdminInvestments />} />
        <Route path="/admin/women-initiatives" element={<AdminWomenInitiatives />} />
        <Route 
          path="/admin/jobs" 
          element={
            <AdminRoute>
              <AdminJobs />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/premium-memberships" 
          element={
            <AdminRoute>
              <PremiumMemberships />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/referrals" 
          element={
            <AdminRoute>
              <AdminReferrals />
            </AdminRoute>
          } 
        />

        {/* Support Routes */}
        <Route path="/support-dashboard" element={<CustomerSupportDashboard />} />

        {/* Marketing Routes */}
        <Route path="/marketing-dashboard" element={<MarketingDashboard />} />

        {/* Superadmin Routes */}
        <Route path="/superadmin-dashboard" element={<SuperadminDashboard />} />

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
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;
