import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaCheckCircle, FaTimes, FaEnvelope, FaPhone, FaUser, FaCommentAlt, FaUserFriends, FaClock } from "react-icons/fa";
import { MdVolunteerActivism } from "react-icons/md";
import { useTranslation } from "react-i18next";
import axios from "../../api/axios";

interface SupportFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  volunteerArea: string;
  availability: string;
}

const SupportForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SupportFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    volunteerArea: "",
    availability: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const volunteerAreas = [
    "Customer Support",
    "Technical Assistance",
    "Community Moderation",
    "Content Creation",
    "Translation Services",
    "Event Organization",
    "Social Media Management",
    "Other"
  ];

  const availabilityOptions = [
    "1-5 hours per week",
    "5-10 hours per week",
    "10-20 hours per week",
    "20+ hours per week",
    "Flexible/As needed"
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
      const response = await axios.post('/support', formData);
      
      if (response.status === 200 || response.status === 201) {
        setSubmitStatus('success');
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          volunteerArea: "",
          availability: "",
        });
        // Redirect to join community after 3 seconds
        setTimeout(() => {
          navigate('/signup');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Support form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.message || "Failed to submit volunteer application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16" style={{ backgroundColor: 'var(--brand-background)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-xl" style={{ background: 'linear-gradient(45deg, var(--brand-primary), var(--brand-secondary))' }}>
            <MdVolunteerActivism className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--brand-black)' }}>
            Become a <span style={{ color: 'var(--brand-primary)' }}>Volunteer</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#4b5563' }}>
            Join our support community and make a difference! Help others, share your expertise, and be part of our growing volunteer team.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {submitStatus === 'success' ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <FaCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--brand-black)' }}>Application Submitted Successfully!</h2>
              <p className="text-lg mb-6" style={{ color: '#4b5563' }}>
                Thank you for your interest in volunteering! We've received your application and will review it within 24-48 hours.
              </p>
              <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
                Our team will contact you soon to discuss next steps.
              </p>
              <Link
                to="/community"
                className="inline-block text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ background: 'linear-gradient(45deg, var(--brand-primary), var(--brand-secondary))' }}
              >
                Back to Community
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all"
                    style={{ 
                      borderColor: formData.name ? 'var(--brand-primary)' : '#e5e7eb'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = formData.name ? 'var(--brand-primary)' : '#e5e7eb'}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all"
                    style={{ 
                      borderColor: formData.email ? 'var(--brand-primary)' : '#e5e7eb'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = formData.email ? 'var(--brand-primary)' : '#e5e7eb'}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all"
                    style={{ 
                      borderColor: formData.phone ? 'var(--brand-primary)' : '#e5e7eb'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = formData.phone ? 'var(--brand-primary)' : '#e5e7eb'}
                    placeholder="+251 912 345 678"
                  />
                </div>
              </div>

              {/* Volunteer Area */}
              <div>
                <label htmlFor="volunteerArea" className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Area of Interest <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUserFriends className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                  <select
                    id="volunteerArea"
                    name="volunteerArea"
                    required
                    value={formData.volunteerArea}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 outline-none transition-all"
                    style={{ 
                      borderColor: formData.volunteerArea ? 'var(--brand-primary)' : '#e5e7eb',
                      focusBorderColor: 'var(--brand-primary)',
                      focusRingColor: 'rgba(46, 61, 211, 0.2)'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = formData.volunteerArea ? 'var(--brand-primary)' : '#e5e7eb'}
                  >
                    <option value="">Select volunteer area</option>
                    {volunteerAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Availability */}
              <div>
                <label htmlFor="availability" className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Availability <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaClock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9ca3af' }} />
                  <select
                    id="availability"
                    name="availability"
                    required
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 outline-none transition-all"
                    style={{ 
                      borderColor: formData.availability ? 'var(--brand-primary)' : '#e5e7eb',
                      focusBorderColor: 'var(--brand-primary)',
                      focusRingColor: 'rgba(46, 61, 211, 0.2)'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = formData.availability ? 'var(--brand-primary)' : '#e5e7eb'}
                  >
                    <option value="">Select your availability</option>
                    {availabilityOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 outline-none transition-all"
                  style={{ 
                    borderColor: formData.subject ? 'var(--brand-primary)' : '#e5e7eb',
                    focusBorderColor: 'var(--brand-primary)',
                    focusRingColor: 'rgba(46, 61, 211, 0.2)'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = formData.subject ? 'var(--brand-primary)' : '#e5e7eb'}
                  placeholder="Brief description of your volunteer interest"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  Tell Us About Yourself <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaCommentAlt className="absolute left-4 top-4 w-5 h-5" style={{ color: '#9ca3af' }} />
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 outline-none transition-all resize-none"
                    style={{ 
                      borderColor: formData.message ? 'var(--brand-primary)' : '#e5e7eb',
                      focusBorderColor: 'var(--brand-primary)',
                      focusRingColor: 'rgba(46, 61, 211, 0.2)'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--brand-primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = formData.message ? 'var(--brand-primary)' : '#e5e7eb'}
                    placeholder="Tell us about your skills, experience, and why you'd like to volunteer with us..."
                  />
                </div>
              </div>

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-3">
                  <FaTimes className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ background: 'linear-gradient(45deg, var(--brand-primary), var(--brand-secondary))' }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Volunteer Application"}
                </button>
                <Link
                  to="/community"
                  className="flex-1 sm:flex-none px-8 py-4 border-2 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 text-center"
                  style={{ 
                    borderColor: 'var(--brand-primary)',
                    color: 'var(--brand-primary)'
                  }}
                >
                  Back to Community
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="mb-4" style={{ color: '#4b5563' }}>
            Have questions about volunteering? <Link to="/contact" className="font-semibold hover:underline" style={{ color: 'var(--brand-primary)' }}>Contact us directly</Link>
          </p>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            After submitting your support request, consider joining our community to connect with other users and access exclusive features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportForm;




