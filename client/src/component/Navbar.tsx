import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTimes, FaUsers, FaHandshake, FaShieldAlt, FaStar, FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { MdConnectWithoutContact, MdVerified } from "react-icons/md";
import { HiSparkles, HiMenuAlt3 } from "react-icons/hi";
import { IoSearchOutline } from "react-icons/io5";
import { getServices, type Service } from "../api/services";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSearchError(null);
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search functionality with debouncing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      
      try {
        const response = await getServices({
          query: searchQuery,
          limit: 10
        });
        setSearchResults(response.services || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchError('Failed to search services');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page or perform search
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
    }
  };

  const handleServiceClick = (service: Service) => {
    // Navigate to service details or booking page
    window.location.href = `/book-service?serviceId=${service.id}`;
    setSearchOpen(false);
  };

  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

    switch (priceType) {
      case 'hourly': return `${formattedPrice}/hour`;
      case 'per_sqft': return `${formattedPrice}/sq ft`;
      case 'custom': return formattedPrice;
      default: return formattedPrice;
    }
  };

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
          <div className="flex justify-between items-center py-2">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2 group cursor-pointer -ml-2 sm:-ml-4 lg:-ml-6">
              <div className="relative">
                <div className={`p-1.5 rounded-lg transition-all duration-300 border-2 ${
                  scrolled ? 'bg-orange-50 border-black' : 'bg-black/80 border-black'
                }`}>
                  <img
                    src="Gezana-logo.PNG"
                    alt="Gezana Logo"
                    className="h-5 sm:h-6 md:h-7 lg:h-8 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute -top-0.5 -right-0.5">
                  <HiSparkles className={`w-4 h-4 ${scrolled ? 'text-orange-500' : 'text-orange-400'} animate-pulse`} />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-sm sm:text-base md:text-lg font-bold text-white transition-colors duration-300 group-hover:text-orange-500`}>
                  Gezana
                </h1>
                <p className={`text-xs sm:text-xs text-orange-400 font-medium transition-colors duration-300`}>
                  Connect • Serve • Succeed
                </p>
              </div>
            </Link>

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
                <Link 
                  to="/about" 
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group text-white hover:text-orange-400 hover:bg-white/10`}
                >
                  <FaUsers className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">About</span>
                </Link>
                
                <Link 
                  to="/services" 
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group text-white hover:text-orange-400 hover:bg-white/10`}
                >
                  <MdConnectWithoutContact className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Services</span>
                </Link>
                
                <Link 
                  to="/contact" 
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group text-white hover:text-orange-400 hover:bg-white/10`}
                >
                  <FaHandshake className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Contact</span>
                </Link>
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
                <div className="p-2 bg-white/20 rounded-xl border-2 border-black">
                  <img
                    src="Gezana-logo.PNG"
                  alt="Gezana Logo"
                  className="h-6 sm:h-8 object-contain"
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
                <Link
                  to="/about"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-4 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                >
                  <FaUsers className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">About Us</span>
                </Link>
                
                <Link
                  to="/services"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-4 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                >
                  <MdConnectWithoutContact className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Our Services</span>
                </Link>
                
                <Link
                  to="/contact"
                  onClick={toggleMenu}
                  className="flex items-center space-x-3 p-4 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                >
                  <FaHandshake className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Contact Us</span>
                </Link>
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 transform transition-all duration-300 animate-in slide-in-from-top-4 max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100">
                <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3">
                  <IoSearchOutline className="w-6 h-6 text-orange-500" />
                  <input
                    type="text"
                    placeholder="Search for services, providers, or categories..."
                    className="flex-1 text-lg border-none outline-none bg-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <FaSearch className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleSearch}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaTimes size={20} />
                  </button>
                </form>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {searchQuery.trim() ? (
                  // Search Results
                  <div className="p-6">
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <span className="ml-3 text-gray-600">Searching...</span>
                      </div>
                    ) : searchError ? (
                      <div className="text-center py-8">
                        <div className="text-red-500 mb-2">⚠️</div>
                        <p className="text-gray-600">{searchError}</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Found {searchResults.length} service{searchResults.length !== 1 ? 's' : ''}
                        </h3>
                        {searchResults.map((service) => (
                          <div
                            key={service.id}
                            onClick={() => handleServiceClick(service)}
                            className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100"
                          >
                            <div className="flex-shrink-0">
                              {service.photos && service.photos.length > 0 ? (
                                <img
                                  src={service.photos[0]}
                                  alt={service.title || (service as any).name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                  <span className="text-orange-600 font-bold text-lg">
                                    {(service.title || (service as any).name || 'S').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-semibold text-gray-900 truncate">
                                {service.title || (service as any).name}
                              </h4>
                              <p className="text-sm text-gray-600 truncate">
                                {service.description || 'No description available'}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center space-x-1">
                                  <FaMapMarkerAlt className="w-3 h-3" />
                                  <span>{service.location || 'Location not specified'}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <FaStar className="w-3 h-3 text-yellow-500" />
                                  <span>{(service.providerRating || 0).toFixed(1)}</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <div className="text-lg font-bold text-orange-600">
                                {formatPrice(service.price || 0, service.priceType || 'fixed')}
                              </div>
                              <div className="text-sm text-gray-500">
                                {service.category || 'Uncategorized'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">🔍</div>
                        <p className="text-gray-600">No services found for "{searchQuery}"</p>
                        <p className="text-sm text-gray-500 mt-1">Try different keywords or check spelling</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Popular Searches
                  <div className="p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Popular Searches</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['Plumbing', 'Cleaning', 'Electrician', 'Painting', 'Gardening', 'Babysitting', 'Carpentry', 'Appliance Repair'].map((item) => (
                        <button
                          key={item}
                          onClick={() => setSearchQuery(item)}
                          className="text-left p-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
