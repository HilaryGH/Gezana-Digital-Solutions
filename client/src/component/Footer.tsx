import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowRight,
  FaHeart,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [expandedSection, setExpandedSection] = useState<string | null>("company");

  const socialLinks = [
    {
      name: "Facebook",
      icon: FaFacebookF,
      href: "https://facebook.com/gezana",
      color: "hover:text-blue-500 hover:bg-blue-500/10",
      bgColor: "group-hover:bg-blue-500/20"
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      href: "https://twitter.com/gezana",
      color: "hover:text-blue-400 hover:bg-blue-400/10",
      bgColor: "group-hover:bg-blue-400/20"
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "https://instagram.com/gezana",
      color: "hover:text-pink-500 hover:bg-pink-500/10",
      bgColor: "group-hover:bg-pink-500/20"
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      href: "https://linkedin.com/company/gezana",
      color: "hover:text-blue-600 hover:bg-blue-600/10",
      bgColor: "group-hover:bg-blue-600/20"
    },
    {
      name: "TikTok",
      icon: FaTiktok,
      href: "https://tiktok.com/@gezana",
      color: "hover:text-pink-600 hover:bg-pink-600/10",
      bgColor: "group-hover:bg-pink-600/20"
    }
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
    { name: "Providers", href: "/providers" }
  ];

  const serviceCategories = [
    { name: "Home Maintenance", href: "/services?category=1" },
    { name: "Cleaning Services", href: "/services?category=2" },
    { name: "Appliance Repair", href: "/services?category=3" },
    { name: "Personal Care", href: "/services?category=4" },
    { name: "Housemaid Services", href: "/services?category=5" },
    { name: "Hotel/Lounge Services", href: "/services?category=6" }
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"></div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            {/* Mobile Collapsible Header */}
            <div 
              className="md:hidden flex items-center justify-between cursor-pointer mb-3"
              onClick={() => setExpandedSection(expandedSection === "company" ? null : "company")}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <img src="/home hub logo.jpg" alt="HomeHub Logo" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">HomeHub</h2>
                  <p className="text-xs text-blue-400 font-medium">Digital Solution</p>
                </div>
              </div>
              {expandedSection === "company" ? (
                <FaChevronUp className="w-4 h-4 text-blue-400" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Desktop Header (always visible) */}
            <div className="hidden md:flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <img src="/home hub logo.jpg" alt="HomeHub Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">HomeHub</h2>
                <p className="text-sm text-blue-400 font-medium">Digital Solution</p>
              </div>
            </div>

            {/* Collapsible Content */}
            <div className={`${expandedSection === "company" ? "block" : "hidden"} md:block transition-all duration-300`}>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              Connecting people with trusted services. Your reliable partner for all home and personal service needs.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:+251911508734" className="flex items-center space-x-3 text-sm text-gray-300 hover:text-blue-400 transition-colors group">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <FaPhone className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform">+251 911 508 734</span>
              </a>
              <a href="mailto:g.fikre2@gmail.com" className="flex items-center space-x-3 text-sm text-gray-300 hover:text-blue-400 transition-colors group">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <FaEnvelope className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="group-hover:translate-x-1 transition-transform">g.fikre2@gmail.com</span>
              </a>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FaMapMarkerAlt className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span>Addis Ababa, Ethiopia</span>
              </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            {/* Mobile Collapsible Header */}
            <div 
              className="md:hidden flex items-center justify-between cursor-pointer mb-3 py-2 border-b border-gray-700"
              onClick={() => setExpandedSection(expandedSection === "links" ? null : "links")}
            >
              <h3 className="text-base font-bold text-white relative">
                Quick Links
              </h3>
              {expandedSection === "links" ? (
                <FaChevronUp className="w-4 h-4 text-blue-400" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Desktop Header */}
            <h3 className="hidden md:block text-lg font-bold text-white mb-4 relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            </h3>

            {/* Collapsible Content */}
            <ul className={`${expandedSection === "links" ? "block" : "hidden"} md:block space-y-2.5 transition-all duration-300`}>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="flex items-center space-x-2 text-sm text-gray-300 hover:text-blue-400 transition-all duration-300 group"
                  >
                    <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Categories */}
          <div>
            {/* Mobile Collapsible Header */}
            <div 
              className="md:hidden flex items-center justify-between cursor-pointer mb-3 py-2 border-b border-gray-700"
              onClick={() => setExpandedSection(expandedSection === "services" ? null : "services")}
            >
              <h3 className="text-base font-bold text-white relative">
                Our Services
              </h3>
              {expandedSection === "services" ? (
                <FaChevronUp className="w-4 h-4 text-blue-400" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Desktop Header */}
            <h3 className="hidden md:block text-lg font-bold text-white mb-4 relative">
              Our Services
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            </h3>

            {/* Collapsible Content */}
            <ul className={`${expandedSection === "services" ? "block" : "hidden"} md:block space-y-2.5 transition-all duration-300`}>
              {serviceCategories.map((service, index) => (
                <li key={index}>
                  <a
                    href={service.href}
                    className="flex items-center space-x-2 text-sm text-gray-300 hover:text-blue-400 transition-all duration-300 group"
                  >
                    <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                    <span className="group-hover:translate-x-1 transition-transform">{service.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            {/* Mobile Collapsible Header */}
            <div 
              className="md:hidden flex items-center justify-between cursor-pointer mb-3 py-2 border-b border-gray-700"
              onClick={() => setExpandedSection(expandedSection === "social" ? null : "social")}
            >
              <h3 className="text-base font-bold text-white relative">
                Stay Connected
              </h3>
              {expandedSection === "social" ? (
                <FaChevronUp className="w-4 h-4 text-blue-400" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Desktop Header */}
            <h3 className="hidden md:block text-lg font-bold text-white mb-4 relative">
              Stay Connected
              <div className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            </h3>
            
            {/* Collapsible Content */}
            <div className={`${expandedSection === "social" ? "block" : "hidden"} md:block transition-all duration-300`}>
            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-sm text-gray-300 mb-3">Subscribe to our newsletter for updates</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 bg-gray-800/50 border-2 border-gray-700 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 text-sm transition-all"
                />
                <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-r-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <p className="text-sm text-gray-300 mb-3">Follow us on social media</p>
              <div className="flex space-x-2">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group w-10 h-10 bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-400 transition-all duration-300 transform hover:scale-110 hover:shadow-lg border-2 border-gray-700 hover:border-blue-500 ${social.color}`}
                      aria-label={social.name}
                    >
                      <IconComponent className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-gray-800/50 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} <span className="text-white font-semibold">HomeHub Digital Solution</span>. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">
                Privacy Policy
              </a>
              <span className="text-gray-600">•</span>
              <a href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">
                Terms of Service
              </a>
              <span className="text-gray-600">•</span>
              <a href="/cookies" className="text-gray-400 hover:text-blue-400 transition-colors font-medium">
                Cookie Policy
              </a>
            </div>
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <FaHeart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>in Ethiopia 🇪🇹</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
