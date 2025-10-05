import { useState, useEffect } from "react";
import { FaTimes, FaUsers, FaHandshake, FaShieldAlt, FaStar } from "react-icons/fa";
import { MdConnectWithoutContact, MdVerified } from "react-icons/md";
import { HiSparkles, HiMenuAlt3 } from "react-icons/hi";
import { IoSearchOutline } from "react-icons/io5";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-black/95 backdrop-blur-xl shadow-2xl border-b border-orange-100/50" 
          : "bg-black shadow-2xl"
      }`}>
        {/* Top Announcement Bar */}
        <div className={`w-full transition-all duration-500 ${
          scrolled ? 'h-0 overflow-hidden' : 'h-12'
        }`}>
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            
            <div className="relative z-10 flex items-center justify-between px-6 py-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live</span>
                </div>
                <p className="text-sm font-medium">
                  🎉 <span className="font-bold">500+</span> new service providers joined this week!
                </p>
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-orange-100">
                  <span className="text-xs">⚡</span>
                  <span className="text-xs">Instant bookings</span>
                </div>
                <div className="flex items-center space-x-2 text-orange-100">
                  <span className="text-xs">🛡️</span>
                  <span className="text-xs">Verified providers</span>
                </div>
                <button 
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3 group cursor-pointer -ml-8 lg:-ml-12">
              <div className="relative">
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  scrolled ? 'bg-orange-50' : 'bg-white/20'
                }`}>
                  <img
                    src="Gezana-logo.PNG"
                    alt="Gezana Logo"
                    className="h-8 md:h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute -top-0.5 -right-0.5">
                  <HiSparkles className={`w-4 h-4 ${scrolled ? 'text-orange-500' : 'text-orange-400'} animate-pulse`} />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold text-white transition-colors duration-300 group-hover:text-orange-500`}>
                  Gezana
                </h1>
                <p className={`text-sm text-orange-400 font-medium transition-colors duration-300`}>
                  Connect • Serve • Succeed
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Search Bar */}
              <div className="relative">
                <button
                  onClick={toggleSearch}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-300 group ${
                    scrolled 
                      ? 'bg-orange-50 text-slate-700 hover:bg-orange-100' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <IoSearchOutline className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Search services, providers, or categories...</span>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center space-x-6">
                <a 
                  href="#about" 
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group text-white hover:text-orange-400 hover:bg-white/10`}
                >
                  <FaUsers className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">About</span>
                </a>
                
                <a 
                  href="#services" 
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group text-white hover:text-orange-400 hover:bg-white/10`}
                >
                  <MdConnectWithoutContact className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Services</span>
                </a>
                
                <a 
                  href="#contact" 
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group text-white hover:text-orange-400 hover:bg-white/10`}
                >
                  <FaHandshake className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Contact</span>
                </a>
              </div>

              {/* Join Button */}
              <button
                onClick={() => setAuthModalOpen(true)}
                className={`relative overflow-hidden px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg group bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500`}
              >
                <span className="relative z-10 flex items-center space-x-1.5">
                  <MdVerified className="w-3.5 h-3.5" />
                  <span>Join</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={toggleSearch}
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  scrolled 
                    ? 'text-slate-700 hover:bg-orange-50' 
                    : 'text-white hover:bg-white/10'
                }`}
                aria-label="Search"
              >
                <IoSearchOutline size={18} />
              </button>
              
              <button
                onClick={toggleMenu}
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  scrolled 
                    ? 'text-slate-700 hover:bg-orange-50' 
                    : 'text-white hover:bg-white/10'
                }`}
                aria-label="Toggle menu"
              >
                {menuOpen ? <FaTimes size={20} /> : <HiMenuAlt3 size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleMenu}
          />
        )}

        {/* Mobile Slide Menu */}
        <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-out lg:hidden shadow-2xl ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-orange-500/20"></div>
              <div className="relative flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <img
                    src="Gezana-logo.PNG"
                  alt="Gezana Logo"
                  className="h-8 object-contain"
                />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Gezana</h2>
                  <p className="text-orange-100 text-xs">Your Service Hub</p>
                </div>
              </div>
              <button
                onClick={toggleMenu}
                className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 p-6 space-y-4">
              <div className="space-y-2">
                <a
                  href="#about"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-4 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                >
                  <FaUsers className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">About Us</span>
                </a>
                
                <a
                  href="#services"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-4 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                >
                  <MdConnectWithoutContact className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Our Services</span>
                </a>
                
                <a
                  href="#contact"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-4 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                >
                  <FaHandshake className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Contact Us</span>
                </a>
              </div>

              {/* Mobile Features */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Why Choose Gezana?</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <FaShieldAlt className="w-4 h-4 text-green-500" />
                    <span>Verified Service Providers</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <FaStar className="w-4 h-4 text-yellow-500" />
                    <span>Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <MdConnectWithoutContact className="w-4 h-4 text-blue-500" />
                    <span>Seamless Connection</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="p-6 bg-gray-50">
              <button
                onClick={() => {
                  toggleMenu();
                  setAuthModalOpen(true);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <MdVerified className="w-5 h-5" />
                <span>Join Gezana Today</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Modal */}
        {searchOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-300 animate-in slide-in-from-top-4">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <IoSearchOutline className="w-6 h-6 text-orange-500" />
                  <input
                    type="text"
                    placeholder="Search for services, providers, or categories..."
                    className="flex-1 text-lg border-none outline-none bg-transparent"
                    autoFocus
                  />
                  <button
                    onClick={toggleSearch}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Popular Searches</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Plumbing', 'Cleaning', 'Electrician', 'Painting', 'Gardening', 'Babysitting'].map((item) => (
                    <button
                      key={item}
                      className="text-left p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
