import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { submitWomenInitiative, type CreateWomenInitiativeData } from "../../api/womenInitiatives";

const WomenInitiativesForm = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<string>("");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("");

  // File states
  const [idPassport, setIdPassport] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<File | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setter(file);
      setError(null);
    }
  };

  const removeFile = (setter: (file: File | null) => void) => {
    setter(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName || !age || !email) {
      setError("Please fill in all required fields");
      return;
    }

    if (!idPassport || !profilePhoto) {
      setError("Please upload required documents (ID/Passport and Profile Photo)");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError("Please enter a valid age");
      return;
    }

    setSubmitting(true);

    try {
      const formData: CreateWomenInitiativeData = {
        fullName,
        age: ageNum,
        email,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
        telegram: telegram || undefined,
        location: location || undefined,
        city: city || undefined,
        idPassport,
        profilePhoto,
        certificates: certificates || undefined,
      };

      await submitWomenInitiative(formData);
      setSuccess(true);
      
      // Reset form
      setFullName("");
      setAge("");
      setEmail("");
      setPhone("");
      setWhatsapp("");
      setTelegram("");
      setLocation("");
      setCity("");
      setIdPassport(null);
      setProfilePhoto(null);
      setCertificates(null);

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError(err.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const FileInput = ({
    label,
    name,
    file,
    setter,
    required = false,
  }: {
    label: string;
    name: string;
    file: File | null;
    setter: (file: File | null) => void;
    required?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-3">
        <label className="flex-1 cursor-pointer">
          <input
            type="file"
            name={name}
            onChange={(e) => handleFileChange(e, setter)}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            required={required}
          />
          <div className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#2E3DD3] transition-colors">
            <Upload className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">
              {file ? file.name : "No file chosen"}
            </span>
          </div>
        </label>
        {file && (
          <button
            type="button"
            onClick={() => removeFile(setter)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500">Max: 5MB</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50/30 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join Women Initiatives
          </h1>
          <p className="text-lg text-gray-600">
            Empower yourself and join our community of amazing women
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Application submitted successfully! We'll get back to you soon.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3] transition-all duration-300"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3] transition-all duration-300"
                placeholder="Enter your age"
                min="1"
                max="120"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3] transition-all duration-300"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3] transition-all duration-300"
                placeholder="Enter your phone"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3] transition-all duration-300"
                placeholder="Enter your whatsapp (optional)"
              />
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3] transition-all duration-300"
                placeholder="Enter your telegram (optional)"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3] transition-all duration-300"
                placeholder="Enter your location"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3] transition-all duration-300"
                placeholder="Enter your city"
              />
            </div>

            {/* Attachments Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
              
              <div className="space-y-4">
                <FileInput
                  label="ID / Driving Licence / Passport"
                  name="idPassport"
                  file={idPassport}
                  setter={setIdPassport}
                  required
                />

                <FileInput
                  label="Profile Photo"
                  name="profilePhoto"
                  file={profilePhoto}
                  setter={setProfilePhoto}
                  required
                />

                <FileInput
                  label="Certificates (Optional)"
                  name="certificates"
                  file={certificates}
                  setter={setCertificates}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-[#2E3DD3] via-[#00AEEF] to-[#F7931E] text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>

          {/* Survey Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 font-medium">Want to transform your business? Take our survey!</p>
              <button
                type="button"
                onClick={() => setShowSurvey(!showSurvey)}
                className="flex items-center gap-2 px-4 py-2 text-[#2E3DD3] hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                {showSurvey ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Hide Survey</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Take Survey</span>
                  </>
                )}
              </button>
            </div>

            {showSurvey && (
              <div className="bg-gradient-to-br from-blue-50 to-orange-50/50 rounded-xl p-6 border-2 border-blue-100">
                <h3 className="text-xl font-bold text-[#2E3DD3] mb-2">Quick Survey</h3>
                <p className="text-gray-600 mb-4">Women's Initiative Surveys - Help us tailor programs by sharing your experience.</p>
                
                {/* Survey Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Survey
                  </label>
                  <select
                    value={selectedSurvey}
                    onChange={(e) => setSelectedSurvey(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3] transition-all"
                  >
                    <option value="">-- Select Survey --</option>
                    <option value="service-provider">Service Providers Capacity Building Survey</option>
                    <option value="training-needs">Underprivileged Women Training Needs Assessment</option>
                  </select>
                  
                  {selectedSurvey && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm font-medium">⚠️ Survey is inactive.</p>
                    </div>
                  )}
                </div>

                {/* Service Provider Survey */}
                {selectedSurvey === "service-provider" && (
                  <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-[#2E3DD3] mb-4">Service Providers Capacity Building Survey</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Provider Type</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location (city/state/region)</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Years in Operation</label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]">
                          <option>Select</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Employees</label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]">
                          <option>Select</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Business Model</label>
                        <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description of Services Offered</label>
                        <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Streams</label>
                        <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Market</label>
                        <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Model Innovation</label>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Interest in New Business Models</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]">
                              <option>Select</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Areas for Innovation</label>
                            <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Barriers to Innovation</label>
                            <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expansion Strategies</label>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Current Expansion Plans</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]">
                              <option>Select</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Desired Areas for Expansion</label>
                            <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Challenges to Expansion</label>
                            <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Digital Literacy Needs</label>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Current Digital Tools Used</label>
                            <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Training Needs in Digital Literacy</label>
                            <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Preferred Training Formats</label>
                            <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Feedback and Suggestions</label>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Additional Supports Needed</label>
                            <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Challenges Not Addressed</label>
                            <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Suggestions for Training Topics</label>
                            <textarea rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-4">We respect your privacy. Responses help us build impactful programs.</p>
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                        >
                          Submit Survey
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Training Needs Assessment Survey */}
                {selectedSurvey === "training-needs" && (
                  <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-[#2E3DD3] mb-4">Underprivileged Women Training Needs Assessment</h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                          <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                          <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Educational Background</label>
                          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                          <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Skills and Experience</label>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Areas Currently Involved In</label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Infant Care</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Food Preparation</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Nutrition and Dietary Services</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Spa and Beauty Services</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Fashion and Design</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Years of Experience</label>
                            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]" />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Specific Skills Possessed</label>
                            <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Training Needs</label>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Skills Needing Improvement</label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Infant Care Techniques</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Healthy Cooking Practices</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Nutritional Knowledge</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Spa Treatments</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Beauty Techniques</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Fashion Design Skills</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Preferred Training Format</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]">
                              <option>Select</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Preferred Duration</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]">
                              <option>Select</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Barriers and Challenges</label>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Challenges in Accessing Training</label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Lack of financial resources</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Transportation issues</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Time constraints (work/family)</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Lack of information about available programs</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded border-gray-300 text-[#2E3DD3] focus:ring-[#2E3DD3]" />
                                <span className="text-sm">Other Challenges</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Additional Comments</label>
                            <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments or Suggestions</label>
                        <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3DD3] focus:border-[#2E3DD3]"></textarea>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-4">We respect your privacy. Responses help us build impactful programs.</p>
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                        >
                          Submit Survey
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomenInitiativesForm;

