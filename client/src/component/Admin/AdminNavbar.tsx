import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Shield, ChevronRight } from "lucide-react";
import { FaUsers, FaCalendarAlt, FaCog, FaUserShield, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const adminName = localStorage.getItem("name") || "Admin";

  const navLinks = [
    { 
      to: "/admin-dashboard", 
      label: "Dashboard", 
      icon: MdDashboard,
      description: "Overview & Analytics"
    },
    { 
      to: "/admin/user", 
      label: "Users", 
      icon: FaUsers,
      description: "Manage Users"
    },
    { 
      to: "/admin/bookings", 
      label: "Bookings", 
      icon: FaCalendarAlt,
      description: "Booking Management"
    },
    { 
      to: "/admin/services", 
      label: "Services", 
      icon: FaCog,
      description: "Service Management"
    },
    { 
      to: "/admin/Providers-list", 
      label: "Providers", 
      icon: FaUserShield,
      description: "Provider Directory"
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 backdrop-blur-md shadow-2xl px-4 py-4 md:pl-72 transition-all duration-300">
        {/* Logo and Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src="/logo 3.png"
                alt="Gezana Logo"
                className="h-10 w-auto object-contain"
              />
              <div className="absolute -top-1 -right-1">
                <HiSparkles className="w-3 h-3 text-orange-400 animate-pulse" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-orange-400" />
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              </div>
              <p className="text-xs text-orange-300 font-medium">Gezana Digital Solutions</p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Admin Info - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{adminName}</p>
                <p className="text-xs text-orange-300">{currentTime.toLocaleTimeString()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {adminName.substring(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logout on desktop */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg py-2 px-4 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-20 left-0 z-40 h-[calc(100vh-80px)] w-64 bg-gradient-to-b from-white to-gray-50 shadow-2xl border-r border-gray-200 px-4 py-6 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Admin Profile - Mobile */}
        <div className="md:hidden mb-6 p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
              {adminName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{adminName}</p>
              <p className="text-orange-100 text-sm">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Navigation</h3>
          </div>
          
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center space-x-3 py-3 px-4 rounded-xl text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-[1.02]"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:transform hover:scale-[1.01]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-orange-500'} group-hover:scale-110 transition-transform`} />
                    <div className="flex-1">
                      <p className="font-medium">{link.label}</p>
                      <p className={`text-xs ${isActive ? 'text-orange-100' : 'text-gray-500'}`}>{link.description}</p>
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

        {/* Admin Status */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-sm font-medium text-green-800">System Status</p>
              <p className="text-xs text-green-600">All services operational</p>
            </div>
          </div>
        </div>

        {/* Mobile Logout Button */}
        <div className="mt-4 md:hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl py-3 font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminNavbar;
