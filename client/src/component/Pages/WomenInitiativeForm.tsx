import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimes, FaEnvelope, FaPhone, FaUser, FaMapMarkerAlt, FaWhatsapp, FaPaperPlane, FaFileUpload, FaImage, FaCertificate } from "react-icons/fa";
import axios from "../../api/axios";
import WomenInitiativeSurvey from "./WomenInitiativeSurvey";

interface WomenInitiativeFormData {
  name: string;
  age: string;
  email: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  location: string;
  city: string;
  idFile: File | null;
  profilePhoto: File | null;
  certificates: File | null;
}

const WomenInitiativeForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<WomenInitiativeFormData>({
    name: "",
    age: "",
    email: "",
    phone: "",
    whatsapp: "",
    telegram: "",
    location: "",
    city: "",
    idFile: null,
    profilePhoto: null,
    certificates: null,
  });

  const [fileNames, setFileNames] = useState({
    idFile: "No file chosen",
    profilePhoto: "No file chosen",
    certificates: "No file chosen",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrorMessage(`${file.name} is too large. Maximum file size is 5MB.`);
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      setFileNames(prev => ({
        ...prev,
        [name]: file.name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('whatsapp', formData.whatsapp);
      formDataToSend.append('telegram', formData.telegram);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('city', formData.city);
      
      if (formData.idFile) {
        formDataToSend.append('idFile', formData.idFile);
      }
      if (formData.profilePhoto) {
        formDataToSend.append('profilePhoto', formData.profilePhoto);
      }
      if (formData.certificates) {
        formDataToSend.append('certificates', formData.certificates);
      }

      const response = await axios.post('/women-initiative', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 200 || response.status === 201) {
        setSubmitStatus('success');
        setFormData({
          name: "",
          age: "",
          email: "",
          phone: "",
          whatsapp: "",
          telegram: "",
          location: "",
          city: "",
          idFile: null,
          profilePhoto: null,
          certificates: null,
        });
        setFileNames({
          idFile: "No file chosen",
          profilePhoto: "No file chosen",
          certificates: "No file chosen",
        });
      }
    } catch (error: any) {
      console.error('Women initiative form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Women <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">Initiatives</span>
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Empower yourself and join our community of amazing women
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-gray-100">
          {submitStatus === 'success' ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <FaCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for your interest in joining the Women's Initiative. We've received your application and will review it shortly.
              </p>
              <Link
                to="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-orange-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Return to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
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
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  required
                  min="18"
                  value={formData.age}
                  onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Enter your age"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
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
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="Enter your phone"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <FaWhatsapp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="Enter your whatsapp (optional)"
                  />
                </div>
              </div>

              {/* Telegram */}
              <div>
                <label htmlFor="telegram" className="block text-sm font-semibold text-gray-700 mb-2">
                  Telegram <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <FaPaperPlane className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="telegram"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="Enter your telegram (optional)"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="Enter your location"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    placeholder="Enter your city"
                  />
                </div>
              </div>

              {/* Attachments Section */}
              <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Attachments</h3>
                
                {/* ID / Driving Licence / Passport */}
                <div className="mb-6">
                  <label htmlFor="idFile" className="block text-sm font-semibold text-gray-700 mb-2">
                    ID / Driving Licence / Passport <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="idFile"
                      name="idFile"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="idFile"
                      className="flex items-center justify-between w-full px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-all bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FaFileUpload className="text-gray-400 w-5 h-5" />
                        <span className="text-sm text-gray-600">{fileNames.idFile}</span>
                      </div>
                      <span className="text-sm text-blue-600 font-semibold">Choose File</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Max: 5MB</p>
                </div>

                {/* Profile Photo */}
                <div className="mb-6">
                  <label htmlFor="profilePhoto" className="block text-sm font-semibold text-gray-700 mb-2">
                    Profile Photo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="profilePhoto"
                      name="profilePhoto"
                      required
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePhoto"
                      className="flex items-center justify-between w-full px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-all bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FaImage className="text-gray-400 w-5 h-5" />
                        <span className="text-sm text-gray-600">{fileNames.profilePhoto}</span>
                      </div>
                      <span className="text-sm text-blue-600 font-semibold">Choose File</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Max: 5MB</p>
                </div>

                {/* Certificates */}
                <div>
                  <label htmlFor="certificates" className="block text-sm font-semibold text-gray-700 mb-2">
                    Certificates <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="certificates"
                      name="certificates"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="certificates"
                      className="flex items-center justify-between w-full px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-all bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FaCertificate className="text-gray-400 w-5 h-5" />
                        <span className="text-sm text-gray-600">{fileNames.certificates}</span>
                      </div>
                      <span className="text-sm text-blue-600 font-semibold">Choose File</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Max: 5MB</p>
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
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Survey Section */}
        {!isSurveyOpen && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-6 text-center border-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Want to transform your business? Take our survey!
            </h3>
            <p className="text-gray-600 mb-4">
              Help us understand your needs better by completing our quick survey.
            </p>
            <button
              onClick={() => setIsSurveyOpen(true)}
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 border-blue-200 hover:border-blue-400"
            >
              <span>📋</span>
              <span>Take Survey</span>
            </button>
          </div>
        )}

        {/* Survey Modal */}
        <WomenInitiativeSurvey isOpen={isSurveyOpen} onClose={() => setIsSurveyOpen(false)} />

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Questions? <Link to="/contact" className="text-blue-600 font-semibold hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WomenInitiativeForm;
