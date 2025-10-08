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

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="lg:col-span-1">
            {/* Mobile Collapsible Header */}
            <div 
              className="md:hidden flex items-center justify-between cursor-pointer mb-3"
              onClick={() => setExpandedSection(expandedSection === "company" ? null : "company")}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <img src="/Gezana-logo.PNG" alt="Gezana Logo" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Gezana</h2>
                  <p className="text-xs text-orange-400 font-medium">Digital Solutions</p>
                </div>
              </div>
              {expandedSection === "company" ? (
                <FaChevronUp className="w-4 h-4 text-orange-400" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Desktop Header (always visible) */}
            <div className="hidden md:flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <img src="/Gezana-logo.PNG" alt="Gezana Logo" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Gezana</h2>
                <p className="text-xs text-orange-400 font-medium">Digital Solutions</p>
              </div>
            </div>

            {/* Collapsible Content */}
            <div className={`${expandedSection === "company" ? "block" : "hidden"} md:block transition-all duration-300`}>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              Connecting people with trusted services. Your reliable partner for all home and personal service needs.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-xs text-gray-300 hover:text-orange-400 transition-colors group cursor-pointer">
                <div className="w-5 h-5 bg-orange-500/20 rounded-md flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                  <FaPhone className="w-2.5 h-2.5 text-orange-400" />
                </div>
                <a href="tel:+251911508734" className="hover:text-orange-400 transition-colors">
                  +251 911 508 734
                </a>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-300 hover:text-orange-400 transition-colors group cursor-pointer">
                <div className="w-5 h-5 bg-orange-500/20 rounded-md flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                  <FaEnvelope className="w-2.5 h-2.5 text-orange-400" />
                </div>
                <a href="mailto:g.fikre2@gmail.com" className="hover:text-orange-400 transition-colors">
                  g.fikre2@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-300 hover:text-orange-400 transition-colors group cursor-pointer">
                <div className="w-5 h-5 bg-orange-500/20 rounded-md flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                  <FaMapMarkerAlt className="w-2.5 h-2.5 text-orange-400" />
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
                <FaChevronUp className="w-4 h-4 text-orange-400" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Desktop Header */}
            <h3 className="hidden md:block text-base font-bold text-white mb-3 relative">
              Quick Links
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            </h3>

            {/* Collapsible Content */}
            <ul className={`${expandedSection === "links" ? "block" : "hidden"} md:block space-y-1.5 transition-all duration-300`}>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="flex items-center space-x-2 text-xs text-gray-300 hover:text-orange-400 transition-all duration-300 group"
                  >
                    <FaArrowRight className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <FaChevronUp className="w-4 h-4 text-orange-400" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Desktop Header */}
            <h3 className="hidden md:block text-base font-bold text-white mb-3 relative">
              Our Services
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            </h3>

            {/* Collapsible Content */}
            <ul className={`${expandedSection === "services" ? "block" : "hidden"} md:block space-y-1.5 transition-all duration-300`}>
              {serviceCategories.map((service, index) => (
                <li key={index}>
                  <a
                    href={service.href}
                    className="flex items-center space-x-2 text-xs text-gray-300 hover:text-orange-400 transition-all duration-300 group"
                  >
                    <FaArrowRight className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <FaChevronUp className="w-4 h-4 text-orange-400" />
              ) : (
                <FaChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Desktop Header */}
            <h3 className="hidden md:block text-base font-bold text-white mb-3 relative">
              Stay Connected
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
            </h3>
            
            {/* Collapsible Content */}
            <div className={`${expandedSection === "social" ? "block" : "hidden"} md:block transition-all duration-300`}>
            {/* Newsletter */}
            <div className="mb-4">
              <p className="text-xs text-gray-300 mb-2">Subscribe to our newsletter for updates</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400 text-xs"
                />
                <button className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-r-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105">
                  <FaArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <p className="text-xs text-gray-300 mb-2">Follow us on social media</p>
              <div className="flex space-x-1.5">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${social.color} ${social.bgColor}`}
                      aria-label={social.name}
                    >
                      <IconComponent className="w-3 h-3" />
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
      <div className="relative z-10 border-t border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-gray-400 text-xs">
              © {currentYear} Gezana Digital Solutions. All rights reserved.
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <a href="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-orange-400 transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-400 hover:text-orange-400 transition-colors">
                Cookie Policy
              </a>
            </div>
            <div className="flex items-center space-x-1 text-gray-400 text-xs">
              <span>Made with</span>
              <FaHeart className="w-2.5 h-2.5 text-red-500 animate-pulse" />
              <span>in Ethiopia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
    </footer>
  );
};

export default Footer;
