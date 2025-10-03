import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaUsers, FaHandshake, FaShieldAlt, FaStar } from "react-icons/fa";
import { MdConnectWithoutContact, MdVerified } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

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
          ? "bg-white/95 backdrop-blur-md shadow-xl border-b border-orange-100" 
          : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
      }`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="Gezana-logo.PNG"
                  alt="Gezana Logo"
                  className="h-10 md:h-12 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute -top-1 -right-1">
                  <HiSparkles className={`w-4 h-4 ${scrolled ? 'text-orange-500' : 'text-orange-400'} animate-pulse`} />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold ${scrolled ? 'text-slate-800' : 'text-white'} transition-colors duration-300`}>
                  Gezana
                </h1>
                <p className={`text-xs ${scrolled ? 'text-orange-600' : 'text-orange-400'} font-medium`}>
                  Connect • Serve • Succeed
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <a 
                  href="#about" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group ${
                    scrolled 
                      ? 'text-slate-700 hover:text-orange-600 hover:bg-orange-50' 
                      : 'text-white hover:text-orange-400 hover:bg-white/10'
                  }`}
                >
                  <FaUsers className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">About Us</span>
                </a>
                
                <a 
                  href="#services" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group ${
                    scrolled 
                      ? 'text-slate-700 hover:text-orange-600 hover:bg-orange-50' 
                      : 'text-white hover:text-orange-400 hover:bg-white/10'
                  }`}
                >
                  <MdConnectWithoutContact className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Services</span>
                </a>
                
                <a 
                  href="#contact" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group ${
                    scrolled 
                      ? 'text-slate-700 hover:text-orange-600 hover:bg-orange-50' 
                      : 'text-white hover:text-orange-400 hover:bg-white/10'
                  }`}
                >
                  <FaHandshake className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Contact</span>
                </a>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setAuthModalOpen(true)}
                className={`relative overflow-hidden px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg group ${
                  scrolled
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500'
                }`}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <MdVerified className="w-4 h-4" />
                  <span>Join Gezana</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                scrolled 
                  ? 'text-slate-700 hover:bg-orange-50' 
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
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
        <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="flex items-center space-x-3">
                <img
                  src="logo 3.png"
                  alt="Gezana Logo"
                  className="h-8 object-contain"
                />
                <div>
                  <h2 className="text-white font-bold text-lg">Gezana</h2>
                  <p className="text-orange-100 text-xs">Your Service Hub</p>
                </div>
              </div>
              <button
                onClick={toggleMenu}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
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
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
