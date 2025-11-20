import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGlobe, FaCheckCircle, FaTimes, FaEnvelope, FaPhone, FaUser, FaMapMarkerAlt, FaFlag } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import axios from "../../api/axios";

interface DiasporaFormData {
  name: string;
  email: string;
  phone: string;
  currentCountry: string;
  originCountry: string;
  city: string;
  interests: string[];
  skills: string;
  message: string;
  wantToConnect: boolean;
}

const DiasporaCommunityForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DiasporaFormData>({
    name: "",
    email: "",
    phone: "",
    currentCountry: "",
    originCountry: "",
    city: "",
    interests: [],
    skills: "",
    message: "",
    wantToConnect: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const commonCountries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany",
    "France", "Italy", "Spain", "Netherlands", "Sweden", "Norway",
    "Switzerland", "Belgium", "Austria", "Denmark", "Ethiopia", "Other"
  ];

  const interestOptions = [
    "Home Services",
    "Investment Opportunities",
    "Cultural Exchange",
    "Business Networking",
    "Technology",
    "Education",
    "Healthcare",
    "Real Estate",
    "Tourism",
    "Community Building",
    "Volunteer Work",
    "Other"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'wantToConnect') {
        setFormData(prev => ({ ...prev, [name]: checked }));
      } else {
        // Handle interests checkbox
        setFormData(prev => ({
          ...prev,
          interests: checked
            ? [...prev.interests, value]
            : prev.interests.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage("");

    try {
      const response = await axios.post('/diaspora', formData);
      
      if (response.status === 200 || response.status === 201) {
        setSubmitStatus('success');
        setFormData({
          name: "",
          email: "",
          phone: "",
          currentCountry: "",
          originCountry: "",
          city: "",
          interests: [],
          skills: "",
          message: "",
          wantToConnect: false,
        });
        // Redirect to join community after 3 seconds
        setTimeout(() => {
          navigate('/signup');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Diaspora form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.message || "Failed to submit diaspora community form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-6 shadow-xl">
            <FaGlobe className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Diaspora <span className="text-orange-600">Community</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with your community, share experiences, and discover opportunities to contribute back home.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {submitStatus === 'success' ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <FaCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Diaspora Community!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for joining our diaspora community. We've received your information and will connect you with other members soon.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Redirecting to join our community in 3 seconds...
              </p>
              <Link
                to="/signup"
                className="inline-block bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Join Community Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              {/* Current Country */}
              <div>
                <label htmlFor="currentCountry" className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    id="currentCountry"
                    name="currentCountry"
                    required
                    value={formData.currentCountry}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none"
                  >
                    <option value="">Select your current country</option>
                    {commonCountries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Origin Country */}
              <div>
                <label htmlFor="originCountry" className="block text-sm font-semibold text-gray-700 mb-2">
                  Country of Origin <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaFlag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    id="originCountry"
                    name="originCountry"
                    required
                    value={formData.originCountry}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all appearance-none"
                  >
                    <option value="">Select your country of origin</option>
                    {commonCountries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  placeholder="Enter your city"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Interests (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <label key={interest} className="flex items-center space-x-2 cursor-pointer p-3 border-2 border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all">
                      <input
                        type="checkbox"
                        name="interests"
                        value={interest}
                        checked={formData.interests.includes(interest)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 mb-2">
                  Skills / Expertise
                </label>
                <textarea
                  id="skills"
                  name="skills"
                  rows={3}
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                  placeholder="Tell us about your skills, expertise, or what you can contribute..."
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                  placeholder="Tell us about yourself, your goals, or how you'd like to contribute to the community..."
                />
              </div>

              {/* Want to Connect */}
              <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                <input
                  type="checkbox"
                  id="wantToConnect"
                  name="wantToConnect"
                  checked={formData.wantToConnect}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="wantToConnect" className="text-sm font-medium text-gray-700 cursor-pointer">
                  I want to connect with other diaspora members and contribute to community projects
                </label>
              </div>

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-3">
                  <FaTimes className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? "Submitting..." : "Join Diaspora Community"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Questions? <Link to="/contact" className="text-orange-600 font-semibold hover:underline">Contact us</Link>
          </p>
          <p className="text-sm text-gray-500">
            After joining the diaspora community, you'll be invited to join our main community platform with exclusive features and networking opportunities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiasporaCommunityForm;




