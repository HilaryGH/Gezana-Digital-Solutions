import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle, FaQuestionCircle, FaHeadset, FaComments, FaBook, FaSearch, FaTicketAlt, FaWhatsapp, FaTelegram, FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "../../api/axios";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType: string;
}

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    serviceType: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const serviceTypes = [
    t('services.categories.cleaning'),
    t('services.categories.maintenance'), 
    t('services.categories.moving'),
    t('services.categories.babysitting'),
    t('services.categories.cooking'),
    t('services.categories.gardening'),
    t('services.categories.petcare'),
    t('services.categories.eldercare'),
    t('common.support'),
    t('common.help')
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage("");

    try {
      // Submit to backend
      const response = await axios.post('/contact', formData);
      
      if (response.status === 200 || response.status === 201) {
        setSubmitStatus('success');
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          serviceType: ""
        });
      }
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportChannels = [
    {
      icon: FaHeadset,
      title: t('common.support'),
      details: "+251 911 234 567",
      description: t('contact.support.phoneDesc'),
      action: "Call Now",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: FaComments,
      title: t('contact.support.liveChat'),
      details: "Live Chat Available",
      description: t('contact.support.chatDesc'),
      action: "Start Chat",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: FaEnvelope,
      title: t('contact.support.email'),
      details: "support@gezana.com",
      description: t('contact.support.emailDesc'),
      action: "Send Email",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: FaTicketAlt,
      title: t('contact.support.ticket'),
      details: "Support Ticket",
      description: t('contact.support.ticketDesc'),
      action: "Create Ticket",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const helpCenterSections = [
    {
      icon: FaQuestionCircle,
      title: t('contact.help.faq'),
      description: t('contact.help.faqDesc'),
      link: "/faq"
    },
    {
      icon: FaBook,
      title: t('contact.help.guides'),
      description: t('contact.help.guidesDesc'),
      link: "/guides"
    },
    {
      icon: FaSearch,
      title: t('contact.help.search'),
      description: t('contact.help.searchDesc'),
      link: "/search"
    }
  ];

  const contactInfo = [
    {
      icon: FaPhone,
      title: "Phone",
      details: "+251 911 508 734",
      description: "Call us anytime",
      link: "tel:+251911508734",
      gradient: "from-blue-600 via-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: FaEnvelope,
      title: "Email",
      details: "g.fikre2@gmail.com",
      description: "Send us an email",
      link: "mailto:g.fikre2@gmail.com",
      gradient: "from-orange-500 via-orange-600 to-blue-600",
      bgGradient: "from-orange-50 to-blue-50"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Address",
      details: "Addis Ababa, Ethiopia",
      description: "Visit our office",
      link: "#",
      gradient: "from-orange-600 via-orange-500 to-blue-600",
      bgGradient: "from-orange-50 to-blue-50"
    },
    {
      icon: FaClock,
      title: "Business Hours",
      details: "Mon - Sat: 8AM - 8PM",
      description: "Sunday: 10AM - 6PM",
      link: "#",
      gradient: "from-blue-600 via-cyan-500 to-orange-500",
      bgGradient: "from-blue-50 via-cyan-50 to-orange-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50/30 pt-20 relative overflow-hidden">
      {/* Decorative Background Elements with Brand Colors */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{
          background: 'radial-gradient(circle, rgba(247, 147, 30, 0.3), rgba(247, 147, 30, 0.1))'
        }}></div>
        <div className="absolute top-40 right-10 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{
          animationDelay: '2s',
          background: 'radial-gradient(circle, rgba(46, 61, 211, 0.3), rgba(46, 61, 211, 0.1))'
        }}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float" style={{
          animationDelay: '4s',
          background: 'radial-gradient(circle, rgba(0, 174, 239, 0.3), rgba(0, 174, 239, 0.1))'
        }}></div>
        {/* Brand color pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(247, 147, 30, 0.1) 50px, rgba(247, 147, 30, 0.1) 100px, transparent 100px, transparent 150px, rgba(46, 61, 211, 0.1) 150px, rgba(46, 61, 211, 0.1) 200px)'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 via-orange-600 to-blue-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <FaEnvelope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-blue-600">Us</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch with our team. We're here to help and ready to connect.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="animate-slide-in-left">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Us</span>
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                We're committed to providing exceptional service and support. Whether you need immediate assistance or have questions about our services, our team is ready to help.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <a
                    key={index}
                    href={info.link}
                    className="group bg-white p-6 rounded-3xl shadow-xl border-2 border-gray-100 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] relative overflow-hidden"
                  >
                    {/* Animated gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${info.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    {/* Brand gradient border on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10 blur-sm`}></div>
                    
                    <div className="relative z-10 flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${info.gradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <IconComponent className="w-8 h-8 text-white relative z-10" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-blue-600 transition-all duration-300">{info.title}</h3>
                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-600 font-bold mb-2 text-sm">{info.details}</p>
                        <p className="text-gray-600 group-hover:text-gray-700 text-xs transition-colors">{info.description}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Social Media Links */}
            <div className="bg-gradient-to-br from-white via-orange-50/50 to-blue-50/50 rounded-3xl p-8 shadow-xl border-2 border-gray-100 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-blue-200/30 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200/30 to-orange-200/30 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <span>Follow</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-600">Us</span>
                </h3>
                <div className="flex flex-wrap gap-4">
                  <a href="#" className="group w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-rotate-6 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <FaFacebook className="w-6 h-6 relative z-10" />
                  </a>
                  <a href="#" className="group w-14 h-14 bg-gradient-to-br from-orange-500 via-pink-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-rotate-6 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <FaInstagram className="w-6 h-6 relative z-10" />
                  </a>
                  <a href="#" className="group w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-rotate-6 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <FaLinkedin className="w-6 h-6 relative z-10" />
                  </a>
                  <a href="#" className="group w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-rotate-6 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <FaWhatsapp className="w-6 h-6 relative z-10" />
                  </a>
                  <a href="#" className="group w-14 h-14 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-2xl transform hover:scale-110 hover:-rotate-6 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <FaTelegram className="w-6 h-6 relative z-10" />
                  </a>
                </div>
              </div>
            </div>

            {/* Why Contact Us */}
            <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-36 -mt-36 group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full -ml-28 -mb-28 group-hover:scale-150 transition-transform duration-1000" style={{ transitionDelay: '0.2s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-1000" style={{ transitionDelay: '0.4s' }}></div>
              
              {/* Brand pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)'
              }}></div>
              
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-bold mb-8 flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <FaCheckCircle className="w-6 h-6" />
                  </div>
                  <span>Why Contact HomeHub?</span>
                </h3>
                <ul className="space-y-5">
                  {[
                    "24/7 Customer Support",
                    "Quick Response Time",
                    "Expert Service Consultation",
                    "Customized Solutions"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center space-x-4 group/item">
                      <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover/item:bg-white/30 group-hover/item:scale-110 transition-all duration-300">
                        <FaCheckCircle className="w-5 h-5" />
                      </div>
                      <span className="text-base font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border-2 border-gray-100 relative overflow-hidden animate-slide-in-right">
            {/* Decorative gradient background with brand colors */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-100 via-orange-50 to-blue-50 rounded-full -mr-48 -mt-48 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-100 via-cyan-50 to-orange-50 rounded-full -ml-40 -mb-40 opacity-40"></div>
            
            {/* Brand pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(247, 147, 30, 0.1) 20px, rgba(247, 147, 30, 0.1) 40px, transparent 40px, transparent 60px, rgba(46, 61, 211, 0.1) 60px, rgba(46, 61, 211, 0.1) 80px)'
            }}></div>
            
            <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaPaperPlane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Send us a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-600">Message</span>
                </h2>
              </div>
            </div>
            <p className="text-gray-600 mb-8 text-base">Fill out the form below and we'll get back to you as soon as possible.</p>

            {submitStatus === 'success' && (
              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-800 font-semibold text-sm">
                    Message sent successfully! We'll get back to you soon.
                  </span>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-lg animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">⚠️</span>
                  </div>
                  <span className="text-red-800 font-semibold text-sm">
                    {errorMessage}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white hover:border-orange-300"
                    placeholder="Your full name"
                  />
                </div>
                <div className="group">
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white hover:border-orange-300"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone and Service Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="phone" className="block text-xs font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white hover:border-orange-300"
                    placeholder="+251 911 234 567"
                  />
                </div>
                <div className="group">
                  <label htmlFor="serviceType" className="block text-xs font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Service Type
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-300 cursor-pointer"
                  >
                    <option value="">Select a service</option>
                    {serviceTypes.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="group">
                <label htmlFor="subject" className="block text-xs font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-300"
                  placeholder="What's this about?"
                />
              </div>

              {/* Message */}
              <div className="group">
                <label htmlFor="message" className="block text-xs font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 resize-none bg-gray-50 focus:bg-white hover:border-gray-300"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-base hover:from-orange-600 hover:via-orange-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3 relative overflow-hidden group"
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                {/* Glow effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-white/20 to-blue-400/0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent relative z-10"></div>
                    <span className="relative z-10">Sending...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-5 h-5 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    <span className="relative z-10">Send Message</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-6 text-center">
              By submitting this form, you agree to our <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold underline">privacy policy</a> and <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold underline">terms of service</a>.
            </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-4">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Questions</span>
            </h2>
            <p className="text-sm text-gray-600 max-w-3xl mx-auto">
              Find quick answers to common questions about our services and contact process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "How quickly do you respond?",
                answer: "We typically respond to all inquiries within 2-4 hours during business hours, and within 24 hours for after-hours messages.",
                gradient: "from-orange-500 to-orange-600",
                hoverGradient: "from-orange-600 to-blue-600"
              },
              {
                question: "Do you provide emergency services?",
                answer: "Yes, we offer 24/7 emergency services for urgent repairs and critical situations. Call our hotline for immediate assistance.",
                gradient: "from-blue-500 to-blue-600",
                hoverGradient: "from-blue-600 to-orange-600"
              },
              {
                question: "Can I get a quote before booking?",
                answer: "Absolutely! We provide free estimates for most services. Contact us with your specific requirements for a detailed quote.",
                gradient: "from-orange-500 to-blue-600",
                hoverGradient: "from-orange-600 to-blue-700"
              },
              {
                question: "What areas do you serve?",
                answer: "We currently serve Addis Ababa and surrounding areas. Contact us to confirm service availability in your specific location.",
                gradient: "from-blue-600 to-orange-500",
                hoverGradient: "from-blue-700 to-orange-600"
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border-2 border-gray-100 hover:shadow-2xl hover:border-transparent transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] group relative overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${faq.hoverGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                
                <div className="flex items-start space-x-4 relative z-10">
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${faq.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <FaQuestionCircle className="w-6 h-6 text-white relative z-10" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-blue-600 transition-all duration-300">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
