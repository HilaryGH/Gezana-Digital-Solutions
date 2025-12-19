import { useState } from "react";
import { NavLink } from "react-router-dom";
import Avatar from "../Avatar";
import { Menu, X, Search, Bell, ChevronRight } from "lucide-react";
import { FaSearch, FaCalendarAlt, FaUser, FaGift, FaStar, FaSignOutAlt, FaMedal } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { HiSparkles, HiBadgeCheck } from "react-icons/hi";

interface SeekerNavbarProps {
  activeSection?: string | null;
  onSectionChange?: (section: string | null) => void;
}

const SeekerNavbar = ({ activeSection, onSectionChange }: SeekerNavbarProps = {}) => {
  const userName = localStorage.getItem("name") || "Service Seeker";
  const initials = userName.slice(0, 2).toUpperCase();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState(2); // Mock notification count
  const [loyaltyPoints] = useState(1250); // Mock loyalty points

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavClick = (section: string | null) => {
    if (onSectionChange) {
      onSectionChange(section);
      setIsOpen(false);
    }
  };


  const navLinks = [
    { 
      to: "/seeker-dashboard", 
      label: "Dashboard", 
      icon: MdDashboard,
      description: "Your Overview",
      color: "purple",
      section: null
    },
    { 
      to: "/my-profile", 
      label: "My Profile", 
      icon: FaUser,
      description: "Profile Settings",
      color: "blue",
      section: "profile"
    },
    { 
      to: "/my-bookings", 
      label: "My Bookings", 
      icon: FaCalendarAlt,
      description: "Track Services",
      color: "green",
      section: "bookings"
    },
    { 
      to: "/services", 
      label: "Browse Services", 
      icon: FaSearch,
      description: "Find Services",
      color: "orange",
      section: "services"
    },
    { 
      to: "/loyalty", 
      label: "Loyalty Points", 
      icon: FaGift,
      description: "Rewards & Benefits",
      color: "yellow",
      section: "loyalty"
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
      {/* Top navbar with logo */}
      <nav className="bg-white text-brand-primary p-4 flex justify-between items-center shadow-md border-b border-gray-100 fixed top-0 left-0 right-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          {/* Logo from public folder */}
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
              <Search className="w-5 h-5 text-brand-accent" />
              <h1 className="text-xl font-bold text-brand-primary">HomeHub Services</h1>
            </div>
            <p className="text-xs text-brand-secondary font-medium">Find Your Perfect Service</p>
          </div>
        </div>
        
        {/* Right: User */}
        <div className="flex items-center space-x-4">
          {/* Quick Search */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-highlight/80" />
              <input 
                type="text" 
                placeholder="Quick search..."
                className="bg-brand-highlight/10 border border-brand-highlight/20 rounded-full py-2 pl-10 pr-4 text-brand-primary placeholder-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications & User Info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-brand-primary hover:text-brand-accent cursor-pointer transition-colors" />
              {notifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-3 bg-brand-highlight/10 rounded-full px-4 py-2">
              <div className="text-right">
                <p className="text-sm font-medium text-brand-primary">{userName}</p>
                <div className="flex items-center space-x-1">
                  <FaGift className="w-3 h-3 text-brand-accent" />
                  <span className="text-xs text-brand-secondary">{loyaltyPoints} pts</span>
                </div>
              </div>
              <div className="relative">
                <Avatar name={initials} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-highlight rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>

          {/* Hamburger toggle */}
          <button
            className="md:hidden p-2 text-brand-primary hover:bg-brand-highlight/10 rounded-lg transition-all duration-200"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800 fixed top-16 left-0 pt-6 shadow-2xl border-r border-gray-200 z-30">
        {/* Seeker Status */}
        <div className="mx-4 mb-6 p-4 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Member Status</h3>
            <FaMedal className="w-5 h-5 text-brand-gold" />
          </div>
          <div className="flex items-center space-x-2">
            <HiBadgeCheck className="w-4 h-4 text-brand-gold" />
            <span className="text-sm">Premium Member</span>
          </div>
        </div>

        <nav className="flex-grow flex flex-col px-4 space-y-2">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Navigation</h3>
          </div>

          {navLinks.map((link) => {
            const IconComponent = link.icon;
            const colorMap: Record<string, string> = {
              purple: 'text-brand-primary',
              blue: 'text-brand-secondary',
              green: 'text-brand-highlight',
              orange: 'text-brand-accent',
              yellow: 'text-brand-gold'
            };
            
            if (onSectionChange) {
              const isActive = link.section === null ? !activeSection : activeSection === link.section;
              return (
                <button
                  key={link.to}
                  onClick={() => handleNavClick(link.section)}
                  className={`group relative flex items-center space-x-3 py-3 px-4 rounded-xl text-sm transition-all duration-200 w-full text-left ${
                    isActive
                      ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg transform scale-[1.02]"
                      : "text-gray-700 hover:bg-brand-highlight/10 hover:text-brand-primary hover:transform hover:scale-[1.01]"
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : colorMap[link.color]} group-hover:scale-110 transition-transform`} />
                  <div className="flex-1">
                    <p className="font-medium">{link.label}</p>
                    <p className={`text-xs ${isActive ? 'text-brand-highlight' : 'text-gray-500'}`}>{link.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-all`} />
                  
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                </button>
              );
            }
            
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

        {/* Loyalty Points Summary */}
        <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-brand-accent/10 to-brand-gold/10 rounded-xl border border-brand-accent/30">
          <div className="flex items-center space-x-2 mb-2">
            <FaGift className="w-4 h-4 text-brand-accent" />
            <h4 className="font-semibold text-brand-primary text-sm">Loyalty Points</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-brand-secondary text-sm">Available</span>
              <span className="text-brand-primary font-bold text-lg">{loyaltyPoints}</span>
            </div>
            <div className="w-full bg-brand-highlight/20 rounded-full h-2">
              <div className="bg-brand-accent h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
            <p className="text-xs text-brand-secondary">250 pts to next reward</p>
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
                    <FaMedal className="w-4 h-4" />
                    <span>Premium Member</span>
                  </p>
                </div>
              </div>
              
              {/* Mobile Quick Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>{notifications} notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaGift className="w-4 h-4" />
                  <span>{loyaltyPoints} points</span>
                </div>
              </div>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-highlight/70" />
                <input 
                  type="text" 
                  placeholder="Search services..."
                  className="w-full bg-brand-highlight/10 border border-brand-highlight/20 rounded-lg py-3 pl-10 pr-4 text-gray-700 placeholder-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="p-6 space-y-3">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const colorMap: Record<string, string> = {
                  purple: 'text-brand-primary',
                  blue: 'text-brand-secondary',
                  green: 'text-brand-highlight',
                  orange: 'text-brand-accent',
                  yellow: 'text-brand-gold'
                };
                
                if (onSectionChange) {
                  const isActive = link.section === null ? !activeSection : activeSection === link.section;
                  return (
                    <button
                      key={link.to}
                      onClick={() => handleNavClick(link.section)}
                      className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 group w-full text-left ${
                        isActive
                          ? "text-white bg-gradient-to-r from-brand-primary to-brand-secondary"
                          : "text-gray-700 hover:text-brand-primary hover:bg-brand-highlight/10"
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : colorMap[link.color]} group-hover:scale-110 transition-transform`} />
                      <div>
                        <p className="font-medium">{link.label}</p>
                        <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>{link.description}</p>
                      </div>
                    </button>
                  );
                }
                
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

              {/* Mobile Loyalty Summary */}
              <div className="mt-8 p-4 bg-gradient-to-r from-brand-accent/10 to-brand-gold/10 rounded-xl border border-brand-accent/30">
                <h4 className="font-semibold text-brand-primary text-sm mb-3 flex items-center space-x-2">
                  <FaGift className="w-4 h-4 text-brand-accent" />
                  <span>Loyalty Rewards</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-brand-primary">{loyaltyPoints}</p>
                    <p className="text-xs text-brand-secondary">Points</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <FaStar className="w-4 h-4 text-brand-gold" />
                      <p className="text-xl font-bold text-brand-primary">75%</p>
                    </div>
                    <p className="text-xs text-brand-secondary">To Reward</p>
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

export default SeekerNavbar;
