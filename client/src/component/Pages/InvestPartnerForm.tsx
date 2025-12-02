import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { submitInvestment, type CreateInvestmentData } from "../../api/investments";

const InvestPartnerForm = () => {
  const navigate = useNavigate();
  const [formType, setFormType] = useState<"investor" | "strategic-partner" | "sponsorship">("investor");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [enquiries, setEnquiries] = useState("");

  // Investor fields
  const [sector, setSector] = useState("");
  const [investmentType, setInvestmentType] = useState("");

  // Strategic Partner fields (sector is shared)

  // Sponsorship fields
  const [officePhone, setOfficePhone] = useState("");
  const [motto, setMotto] = useState("");
  const [specialPackages, setSpecialPackages] = useState("");
  const [messages, setMessages] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // File states
  const [idPassport, setIdPassport] = useState<File | null>(null);
  const [license, setLicense] = useState<File | null>(null);
  const [tradeRegistration, setTradeRegistration] = useState<File | null>(null);
  const [businessProposal, setBusinessProposal] = useState<File | null>(null);
  const [businessPlan, setBusinessPlan] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [mouSigned, setMouSigned] = useState<File | null>(null);
  const [contractSigned, setContractSigned] = useState<File | null>(null);

  const sectors = [
    "Media & Entertainment",
    "Technology",
    "Healthcare",
    "Education",
    "Real Estate",
    "Finance",
    "Retail",
    "Hospitality",
    "Transportation",
    "Other",
  ];

  const investmentTypes = [
    "Equity Investment",
    "Debt Financing",
    "Joint Venture",
    "Strategic Partnership",
    "Sponsorship",
    "Other",
  ];

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
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
    setSubmitting(true);

    try {
      const formData: CreateInvestmentData = {
        type: formType,
        name,
        email,
        phone,
        whatsapp: whatsapp || undefined,
        companyName: companyName || undefined,
        enquiries: enquiries || undefined,
      };

      // Add type-specific fields
      if (formType === "investor") {
        if (!sector || !investmentType) {
          setError("Sector and Investment Type are required for investors");
          setSubmitting(false);
          return;
        }
        formData.sector = sector;
        formData.investmentType = investmentType;
        if (idPassport) formData.idPassport = idPassport;
        if (license) formData.license = license;
        if (tradeRegistration) formData.tradeRegistration = tradeRegistration;
      } else if (formType === "strategic-partner") {
        if (!sector) {
          setError("Sector is required for strategic partners");
          setSubmitting(false);
          return;
        }
        formData.sector = sector;
        if (businessProposal) formData.businessProposal = businessProposal;
        if (businessPlan) formData.businessPlan = businessPlan;
        if (logo) formData.logo = logo;
        if (mouSigned) formData.mouSigned = mouSigned;
        if (contractSigned) formData.contractSigned = contractSigned;
      } else if (formType === "sponsorship") {
        if (officePhone) formData.officePhone = officePhone;
        if (motto) formData.motto = motto;
        if (specialPackages) formData.specialPackages = specialPackages;
        if (messages) formData.messages = messages;
        if (effectiveDate) formData.effectiveDate = effectiveDate;
        if (expiryDate) formData.expiryDate = expiryDate;
        if (logo) formData.logo = logo;
        if (mouSigned) formData.mouSigned = mouSigned;
        if (contractSigned) formData.contractSigned = contractSigned;
      }

      await submitInvestment(formData);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error submitting investment:", err);
      setError(err.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const FileInput = ({
    label,
    file,
    setter,
    accept = "*/*",
  }: {
    label: string;
    file: File | null;
    setter: (file: File | null) => void;
    accept?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <label className="flex-1 cursor-pointer">
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(e, setter)}
            className="hidden"
          />
          <div className="flex items-center justify-between px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition-colors">
            <span className="text-gray-600 text-sm">
              {file ? file.name : "No file chosen"}
            </span>
            <Upload className="w-5 h-5 text-gray-400" />
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
      <p className="text-xs text-gray-500 mt-1">Max: 10MB</p>
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest. We'll review your application and get back to you soon.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invest / Partner With Us</h1>
          <p className="text-gray-600 mb-6">Fill out the form below to get started</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(["investor", "strategic-partner", "sponsorship"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormType(type)}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    formType === type
                      ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type === "investor"
                    ? "Investor"
                    : type === "strategic-partner"
                    ? "Strategic Partner"
                    : "Sponsorship"}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+251 9XX XXX XXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+251 9XX XXX XXX"
                />
              </div>
              {formType === "sponsorship" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Office Phone
                  </label>
                  <input
                    type="tel"
                    value={officePhone}
                    onChange={(e) => setOfficePhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+251 9XX XXX XXX"
                  />
                </div>
              )}
            </div>

            {/* Investor Specific Fields */}
            {formType === "investor" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sector *
                    </label>
                    <select
                      required
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">-- Select Sector --</option>
                      {sectors.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Investment Type *
                    </label>
                    <select
                      required
                      value={investmentType}
                      onChange={(e) => setInvestmentType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">-- Select Investment Type --</option>
                      {investmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                  <FileInput
                    label="ID / Passport / Driving Licence"
                    file={idPassport}
                    setter={setIdPassport}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <FileInput
                    label="License"
                    file={license}
                    setter={setLicense}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <FileInput
                    label="Trade Registration"
                    file={tradeRegistration}
                    setter={setTradeRegistration}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </>
            )}

            {/* Strategic Partner Specific Fields */}
            {formType === "strategic-partner" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sector *
                  </label>
                  <select
                    required
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">-- Select Sector --</option>
                    {sectors.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                  <FileInput
                    label="Business Proposal"
                    file={businessProposal}
                    setter={setBusinessProposal}
                    accept=".pdf,.doc,.docx"
                  />
                  <FileInput
                    label="Business Plan"
                    file={businessPlan}
                    setter={setBusinessPlan}
                    accept=".pdf,.doc,.docx"
                  />
                  <FileInput
                    label="Logo"
                    file={logo}
                    setter={setLogo}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                  />
                  <FileInput
                    label="MOU Signed"
                    file={mouSigned}
                    setter={setMouSigned}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <FileInput
                    label="Contract Signed"
                    file={contractSigned}
                    setter={setContractSigned}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </>
            )}

            {/* Sponsorship Specific Fields */}
            {formType === "sponsorship" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motto
                  </label>
                  <input
                    type="text"
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your motto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Packages
                  </label>
                  <textarea
                    rows={3}
                    value={specialPackages}
                    onChange={(e) => setSpecialPackages(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Describe special packages"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Messages
                  </label>
                  <textarea
                    rows={3}
                    value={messages}
                    onChange={(e) => setMessages(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your messages"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
                  <FileInput
                    label="Logo"
                    file={logo}
                    setter={setLogo}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                  />
                  <FileInput
                    label="MOU Signed"
                    file={mouSigned}
                    setter={setMouSigned}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <FileInput
                    label="Contract Signed"
                    file={contractSigned}
                    setter={setContractSigned}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </>
            )}

            {/* Enquiries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enquiries
              </label>
              <textarea
                rows={4}
                value={enquiries}
                onChange={(e) => setEnquiries(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Type your message..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvestPartnerForm;




