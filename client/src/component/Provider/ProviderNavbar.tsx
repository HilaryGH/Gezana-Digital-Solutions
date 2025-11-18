import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Avatar from "../Avatar";
import { Menu, X, Calendar, Plus, User, List, Bell, ChevronRight } from "lucide-react";
import { FaTools, FaStar, FaChartLine, FaSignOutAlt, FaCrown } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { HiSparkles, HiBadgeCheck } from "react-icons/hi";

const ProviderNavbar = () => {
  const [userName, setUserName] = useState("Provider");
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications] = useState(3); // Mock notification count

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PR";

  const navLinks = [
    { 
      to: "/provider-dashboard", 
      label: "Dashboard", 
      icon: MdDashboard,
      description: "Overview & Insights",
      color: "blue"
    },
    { 
      to: "/provider/bookings", 
      label: "Bookings", 
      icon: Calendar,
      description: "Manage Appointments",
      color: "green"
    },
    { 
      to: "/provider/add-service", 
      label: "Add Service", 
      icon: Plus,
      description: "Create New Service",
      color: "orange"
    },
    { 
      to: "/my-profile", 
      label: "My Profile", 
      icon: User,
      description: "Profile Settings",
      color: "purple"
    },
    { 
      to: "/provider/service-lists", 
      label: "Service Lists", 
      icon: List,
      description: "View All Services",
      color: "indigo"
    },
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
    localStorage.clear();
    window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Top navbar */}
      <nav className="bg-white text-brand-primary p-4 flex justify-between items-center shadow-md border-b border-gray-100 fixed top-0 left-0 right-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="relative">
          <img
            src="/logo correct.png"
              alt="HomeHub Logo"
              className="w-auto h-10 object-contain"
            />
              <div className="absolute -top-1 -right-1">
                <HiSparkles className="w-3 h-3 text-brand-accent animate-pulse" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <FaTools className="w-5 h-5 text-brand-accent" />
              <h1 className="text-xl font-bold text-brand-primary">HomeHub Providers</h1>
            </div>
            <p className="text-xs text-brand-secondary font-medium">Your Service Hub</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-brand-primary hover:text-brand-accent cursor-pointer transition-colors" />
              {notifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              )}
            </div>
            
            {/* Provider Info */}
            <div className="flex items-center space-x-3 bg-brand-highlight/10 rounded-full px-4 py-2">
              <div className="text-right">
                <p className="text-sm font-medium text-brand-primary">{userName}</p>
                <p className="text-xs text-brand-secondary">{currentTime.toLocaleTimeString()}</p>
              </div>
              <div className="relative">
                <Avatar name={initials} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-highlight rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>

          <button
            className="md:hidden p-2 text-brand-primary hover:bg-brand-highlight/10 rounded-lg transition-all duration-200"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800 fixed top-16 left-0 pt-6 shadow-2xl border-r border-gray-200 z-30">
        {/* Provider Stats */}
        <div className="mx-4 mb-6 p-4 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Provider Status</h3>
            <HiBadgeCheck className="w-5 h-5 text-brand-gold" />
          </div>
          <div className="flex items-center space-x-2">
            <FaCrown className="w-4 h-4 text-brand-gold" />
            <span className="text-sm">Verified Provider</span>
          </div>
        </div>

        <nav className="flex-grow flex flex-col px-4 space-y-2">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Navigation</h3>
          </div>

          {navLinks.map((link) => {
            const IconComponent = link.icon;
            const colorMap: Record<string, string> = {
              blue: 'text-brand-primary',
              green: 'text-brand-secondary',
              orange: 'text-brand-accent',
              purple: 'text-brand-highlight',
              indigo: 'text-brand-primary'
            };
            
            return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                  `group relative flex items-center space-x-3 py-3 px-4 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg transform scale-[1.02]"
                      : "text-gray-700 hover:bg-brand-highlight/10 hover:text-brand-primary hover:transform hover:scale-[1.01]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : colorMap[link.color]} group-hover:scale-110 transition-transform`} />
                    <div className="flex-1">
                      <p className="font-medium">{link.label}</p>
                      <p className={`text-xs ${isActive ? 'text-brand-highlight' : 'text-gray-500'}`}>{link.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-all`} />
                    
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                    )}
                  </>
                )}
            </NavLink>
            );
          })}
        </nav>

        {/* Performance Stats */}
        <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-brand-highlight/10 to-brand-secondary/10 rounded-xl border border-brand-highlight/30">
          <div className="flex items-center space-x-2 mb-2">
            <FaChartLine className="w-4 h-4 text-brand-primary" />
            <h4 className="font-semibold text-brand-primary text-sm">This Month</h4>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-brand-secondary">Bookings</span>
              <span className="text-brand-primary font-semibold">24</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-brand-secondary">Rating</span>
              <div className="flex items-center space-x-1">
                <FaStar className="w-3 h-3 text-brand-gold" />
                <span className="text-brand-primary font-semibold">4.8</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl py-3 font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile menu drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed top-16 left-0 z-50 w-80 max-w-[85vw] h-full bg-white shadow-2xl overflow-auto">
            {/* Mobile Header */}
            <div className="p-6 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <Avatar name={initials} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-highlight rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{userName}</h2>
                  <p className="text-brand-highlight text-sm flex items-center space-x-1">
                    <HiBadgeCheck className="w-4 h-4" />
                    <span>Verified Provider</span>
                  </p>
                </div>
              </div>
              
              {/* Notifications in mobile */}
              <div className="flex items-center space-x-2 text-sm">
                <Bell className="w-4 h-4" />
                <span>{notifications} new notifications</span>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="p-6 space-y-3">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const colorMap: Record<string, string> = {
                  blue: 'text-brand-primary',
                  green: 'text-brand-secondary',
                  orange: 'text-brand-accent',
                  purple: 'text-brand-highlight',
                  indigo: 'text-brand-primary'
                };
                
                return (
              <NavLink
                key={link.to}
                to={link.to}
                    className="flex items-center space-x-3 p-4 text-gray-700 hover:text-brand-primary hover:bg-brand-highlight/10 rounded-xl transition-all duration-200 group"
                onClick={() => setIsOpen(false)}
              >
                    <IconComponent className={`w-5 h-5 ${colorMap[link.color]} group-hover:scale-110 transition-transform`} />
                    <div>
                      <p className="font-medium">{link.label}</p>
                      <p className="text-xs text-gray-500">{link.description}</p>
                    </div>
              </NavLink>
                );
              })}

              {/* Mobile Stats */}
              <div className="mt-8 p-4 bg-gradient-to-r from-brand-highlight/10 to-brand-secondary/10 rounded-xl border border-brand-highlight/30">
                <h4 className="font-semibold text-brand-primary text-sm mb-3">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-brand-primary">24</p>
                    <p className="text-xs text-brand-secondary">Bookings</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <FaStar className="w-4 h-4 text-brand-gold" />
                      <p className="text-xl font-bold text-brand-primary">4.8</p>
                    </div>
                    <p className="text-xs text-brand-secondary">Rating</p>
                  </div>
                </div>
              </div>

            <button
              onClick={handleLogout}
                className="mt-6 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl py-4 font-semibold transition-all duration-300"
            >
                <FaSignOutAlt className="w-4 h-4" />
                <span>Logout</span>
            </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProviderNavbar;
