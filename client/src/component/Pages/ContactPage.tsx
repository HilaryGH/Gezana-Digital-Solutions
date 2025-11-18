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
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: FaEnvelope,
      title: "Email",
      details: "g.fikre2@gmail.com",
      description: "Send us an email",
      link: "mailto:g.fikre2@gmail.com",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Address",
      details: "Addis Ababa, Ethiopia",
      description: "Visit our office",
      link: "#",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: FaClock,
      title: "Business Hours",
      details: "Mon - Sat: 8AM - 8PM",
      description: "Sunday: 10AM - 6PM",
      link: "#",
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-3xl mb-6 shadow-2xl shadow-orange-500/50 transform hover:scale-110 transition-transform duration-300">
            <FaHeadset className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            {t('contact.title') || 'Get in'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700">{t('contact.subtitle') || 'Touch'}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('contact.description') || "We're here to help! Reach out to us and let's start a conversation."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Us</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
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
                    className="group bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden"
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                    
                    <div className="relative z-10 flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${info.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{info.title}</h3>
                        <p className="text-orange-600 font-semibold mb-2">{info.details}</p>
                        <p className="text-gray-600 text-sm">{info.description}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Social Media Links */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                  <FaFacebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                  <FaLinkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                  <FaWhatsapp className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">
                  <FaTelegram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Why Contact Us */}
            <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold mb-6">Why Contact HomeHub?</h3>
                <ul className="space-y-4">
                  <li className="flex items-center space-x-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <FaCheckCircle className="w-5 h-5 text-orange-100" />
                    </div>
                    <span className="text-lg">24/7 Customer Support</span>
                  </li>
                  <li className="flex items-center space-x-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <FaCheckCircle className="w-5 h-5 text-orange-100" />
                    </div>
                    <span className="text-lg">Quick Response Time</span>
                  </li>
                  <li className="flex items-center space-x-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <FaCheckCircle className="w-5 h-5 text-orange-100" />
                    </div>
                    <span className="text-lg">Expert Service Consultation</span>
                  </li>
                  <li className="flex items-center space-x-4 group">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <FaCheckCircle className="w-5 h-5 text-orange-100" />
                    </div>
                    <span className="text-lg">Customized Solutions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 relative overflow-hidden animate-slide-in-right">
            {/* Decorative gradient background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full -mr-48 -mt-48 opacity-50"></div>
            <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Send us a <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Message</span>
            </h2>
            <p className="text-gray-500 mb-6">Fill out the form below and we'll get back to you as soon as possible.</p>

            {submitStatus === 'success' && (
              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-800 font-semibold text-lg">
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
                  <span className="text-red-800 font-semibold text-lg">
                    {errorMessage}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-300"
                    placeholder="Your full name"
                  />
                </div>
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-300"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone and Service Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-300"
                    placeholder="+251 911 234 567"
                  />
                </div>
                <div className="group">
                  <label htmlFor="serviceType" className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
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
                <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
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
                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2 group-focus-within:text-orange-600 transition-colors">
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
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Send Message</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-6 text-center">
              By submitting this form, you agree to our <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold underline">privacy policy</a> and <a href="#" className="text-orange-600 hover:text-orange-700 font-semibold underline">terms of service</a>.
            </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find quick answers to common questions about our services and contact process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaQuestionCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">How quickly do you respond?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We typically respond to all inquiries within 2-4 hours during business hours, and within 24 hours for after-hours messages.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaQuestionCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Do you provide emergency services?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Yes, we offer 24/7 emergency services for urgent repairs and critical situations. Call our hotline for immediate assistance.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaQuestionCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Can I get a quote before booking?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Absolutely! We provide free estimates for most services. Contact us with your specific requirements for a detailed quote.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaQuestionCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">What areas do you serve?</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We currently serve Addis Ababa and surrounding areas. Contact us to confirm service availability in your specific location.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
