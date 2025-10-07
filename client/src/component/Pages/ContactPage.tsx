import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
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
    "Home Maintenance",
    "Cleaning Services", 
    "Appliance Repair",
    "Personal Care",
    "Housemaid Services",
    "Hotel/Lounge Services",
    "General Inquiry"
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

  const contactInfo = [
    {
      icon: FaPhone,
      title: "Phone",
      details: "+251 911 234 567",
      description: "Call us for immediate assistance"
    },
    {
      icon: FaEnvelope,
      title: "Email",
      details: "info@gezana.com",
      description: "Send us an email anytime"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Address",
      details: "Addis Ababa, Ethiopia",
      description: "Visit our main office"
    },
    {
      icon: FaClock,
      title: "Business Hours",
      details: "24/7 Available",
      description: "We're always here to help"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
            <span className="text-2xl">📞</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Contact <span className="text-orange-600">Us</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get in touch with us for any questions, service requests, or support. We're here to help you 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Get in <span className="text-orange-600">Touch</span>
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
                  <div
                    key={index}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{info.title}</h3>
                        <p className="text-orange-600 font-medium mb-2">{info.details}</p>
                        <p className="text-gray-600 text-sm">{info.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Why Contact Us */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Why Contact Gezana?</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <FaCheckCircle className="w-5 h-5 text-orange-200" />
                  <span>24/7 Customer Support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <FaCheckCircle className="w-5 h-5 text-orange-200" />
                  <span>Quick Response Time</span>
                </li>
                <li className="flex items-center space-x-3">
                  <FaCheckCircle className="w-5 h-5 text-orange-200" />
                  <span>Expert Service Consultation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <FaCheckCircle className="w-5 h-5 text-orange-200" />
                  <span>Customized Solutions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Send us a <span className="text-orange-600">Message</span>
            </h2>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Message sent successfully! We'll get back to you soon.
                  </span>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span className="text-red-600">⚠️</span>
                  <span className="text-red-800 font-medium">
                    {errorMessage}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone and Service Type Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="+251 911 234 567"
                  />
                </div>
                <div>
                  <label htmlFor="serviceType" className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="What's this about?"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-4 text-center">
              By submitting this form, you agree to our privacy policy and terms of service.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked <span className="text-orange-600">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find quick answers to common questions about our services and contact process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How quickly do you respond?</h3>
              <p className="text-gray-600">
                We typically respond to all inquiries within 2-4 hours during business hours, and within 24 hours for after-hours messages.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Do you provide emergency services?</h3>
              <p className="text-gray-600">
                Yes, we offer 24/7 emergency services for urgent repairs and critical situations. Call our hotline for immediate assistance.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I get a quote before booking?</h3>
              <p className="text-gray-600">
                Absolutely! We provide free estimates for most services. Contact us with your specific requirements for a detailed quote.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What areas do you serve?</h3>
              <p className="text-gray-600">
                We currently serve Addis Ababa and surrounding areas. Contact us to confirm service availability in your specific location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
