import { useState } from "react";
import Navbar from "../Navbar";

const InvestPartnerPage = () => {
  const [investFormData, setInvestFormData] = useState({
    type: 'Investor', // Default to Investor
    // Investor fields
    sector: '',
    investmentType: '',
    name: '',
    companyName: '',
    email: '',
    phone: '',
    whatsapp: '',
    idFile: null as File | null,
    licenseFile: null as File | null,
    tradeRegistrationFile: null as File | null,
    enquiries: '',
    // Strategic Partner fields
    businessProposalFile: null as File | null,
    businessPlanFile: null as File | null,
    logoFile: null as File | null,
    mouSignedFile: null as File | null,
    contractSignedFile: null as File | null,
    // Sponsor fields
    officePhone: '',
    motto: '',
    specialPackages: '',
    messages: '',
    effectiveDate: '',
    expiryDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', investFormData);
    alert('Thank you for your interest! We will contact you soon.');
    // Reset form
    setInvestFormData({
      type: 'Investor',
      sector: '',
      investmentType: '',
      name: '',
      companyName: '',
      email: '',
      phone: '',
      whatsapp: '',
      idFile: null,
      licenseFile: null,
      tradeRegistrationFile: null,
      enquiries: '',
      businessProposalFile: null,
      businessPlanFile: null,
      logoFile: null,
      mouSignedFile: null,
      contractSignedFile: null,
      officePhone: '',
      motto: '',
      specialPackages: '',
      messages: '',
      effectiveDate: '',
      expiryDate: ''
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              Invest / Partner <span className="text-purple-600">With Us</span>
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              Explore investment opportunities and strategic partnerships to grow with HomeHub.
            </p>
          </div>

          {/* Invest / Partner With Us Form */}
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Type</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="Investor"
                      checked={investFormData.type === 'Investor'}
                      onChange={(e) => setInvestFormData({...investFormData, type: e.target.value})}
                      className="w-4 h-4 text-blue-600"
                      required
                    />
                    <span className="text-gray-700">Investor</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="Strategic Partner"
                      checked={investFormData.type === 'Strategic Partner'}
                      onChange={(e) => setInvestFormData({...investFormData, type: e.target.value})}
                      className="w-4 h-4 text-blue-600"
                      required
                    />
                    <span className="text-gray-700">Strategic Partner</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="Sponsorship"
                      checked={investFormData.type === 'Sponsorship'}
                      onChange={(e) => setInvestFormData({...investFormData, type: e.target.value})}
                      className="w-4 h-4 text-blue-600"
                      required
                    />
                    <span className="text-gray-700">Sponsorship</span>
                  </label>
                </div>
              </div>

              {/* Investor Form Fields */}
              {investFormData.type === 'Investor' && (
                <>
                  {/* Sector and Investment Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sector</label>
                      <select
                        value={investFormData.sector}
                        onChange={(e) => setInvestFormData({...investFormData, sector: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">-- Select Sector --</option>
                        <option value="Technology">Technology</option>
                        <option value="Services">Services</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Investment Type</label>
                      <select
                        value={investFormData.investmentType}
                        onChange={(e) => setInvestFormData({...investFormData, investmentType: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">-- Select Investment Type --</option>
                        <option value="Equity">Equity</option>
                        <option value="Debt">Debt</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Sponsorship">Sponsorship</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Name and Company Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name</label>
                      <input
                        type="text"
                        value={investFormData.name}
                        onChange={(e) => setInvestFormData({...investFormData, name: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name</label>
                      <input
                        type="text"
                        value={investFormData.companyName}
                        onChange={(e) => setInvestFormData({...investFormData, companyName: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={investFormData.email}
                        onChange={(e) => setInvestFormData({...investFormData, email: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={investFormData.phone}
                        onChange={(e) => setInvestFormData({...investFormData, phone: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                    <input
                      type="tel"
                      value={investFormData.whatsapp}
                      onChange={(e) => setInvestFormData({...investFormData, whatsapp: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* File Uploads */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">ID / Passport / Driving Licence</label>
                      <div className="flex items-center flex-wrap gap-2">
                        <input
                          type="file"
                          onChange={(e) => setInvestFormData({...investFormData, idFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="idFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="idFile"
                          className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {investFormData.idFile ? investFormData.idFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">License</label>
                      <div className="flex items-center flex-wrap gap-2">
                        <input
                          type="file"
                          onChange={(e) => setInvestFormData({...investFormData, licenseFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="licenseFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="licenseFile"
                          className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {investFormData.licenseFile ? investFormData.licenseFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Trade Registration</label>
                      <div className="flex items-center flex-wrap gap-2">
                        <input
                          type="file"
                          onChange={(e) => setInvestFormData({...investFormData, tradeRegistrationFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="tradeRegistrationFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="tradeRegistrationFile"
                          className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {investFormData.tradeRegistrationFile ? investFormData.tradeRegistrationFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enquiries */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Enquiries</label>
                    <textarea
                      value={investFormData.enquiries}
                      onChange={(e) => setInvestFormData({...investFormData, enquiries: e.target.value})}
                      rows={3}
                      placeholder="Type your message..."
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </>
              )}

              {/* Strategic Partner Form Fields */}
              {investFormData.type === 'Strategic Partner' && (
                <>
                  {/* Sector */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sector</label>
                    <select
                      value={investFormData.sector}
                      onChange={(e) => setInvestFormData({...investFormData, sector: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">-- Select Sector --</option>
                      <option value="Technology">Technology</option>
                      <option value="Services">Services</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Name and Company Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name</label>
                      <input
                        type="text"
                        value={investFormData.name}
                        onChange={(e) => setInvestFormData({...investFormData, name: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name</label>
                      <input
                        type="text"
                        value={investFormData.companyName}
                        onChange={(e) => setInvestFormData({...investFormData, companyName: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={investFormData.email}
                        onChange={(e) => setInvestFormData({...investFormData, email: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={investFormData.phone}
                        onChange={(e) => setInvestFormData({...investFormData, phone: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                    <input
                      type="tel"
                      value={investFormData.whatsapp}
                      onChange={(e) => setInvestFormData({...investFormData, whatsapp: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Attachments */}
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-700">Attachments</h3>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Proposal</label>
                      <div className="flex items-center flex-wrap gap-2">
                        <input
                          type="file"
                          onChange={(e) => setInvestFormData({...investFormData, businessProposalFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="businessProposalFile"
                          accept=".pdf,.doc,.docx"
                        />
                        <label
                          htmlFor="businessProposalFile"
                          className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {investFormData.businessProposalFile ? investFormData.businessProposalFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Business Plan</label>
                      <div className="flex items-center flex-wrap gap-2">
                        <input
                          type="file"
                          onChange={(e) => setInvestFormData({...investFormData, businessPlanFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="businessPlanFile"
                          accept=".pdf,.doc,.docx"
                        />
                        <label
                          htmlFor="businessPlanFile"
                          className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {investFormData.businessPlanFile ? investFormData.businessPlanFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Logo</label>
                      <div className="flex items-center flex-wrap gap-2">
                        <input
                          type="file"
                          onChange={(e) => setInvestFormData({...investFormData, logoFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="logoFile"
                          accept=".jpg,.jpeg,.png,.svg"
                        />
                        <label
                          htmlFor="logoFile"
                          className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {investFormData.logoFile ? investFormData.logoFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">MOU Signed</label>
                      <div className="flex items-center flex-wrap gap-2">
                        <input
                          type="file"
                          onChange={(e) => setInvestFormData({...investFormData, mouSignedFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="mouSignedFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="mouSignedFile"
                          className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {investFormData.mouSignedFile ? investFormData.mouSignedFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contract Signed</label>
                      <div className="flex items-center flex-wrap gap-2">
                        <input
                          type="file"
                          onChange={(e) => setInvestFormData({...investFormData, contractSignedFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="contractSignedFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="contractSignedFile"
                          className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {investFormData.contractSignedFile ? investFormData.contractSignedFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enquiries */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Enquiries</label>
                    <textarea
                      value={investFormData.enquiries}
                      onChange={(e) => setInvestFormData({...investFormData, enquiries: e.target.value})}
                      rows={3}
                      placeholder="Type your message..."
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </>
              )}

              {/* Sponsor Form Fields */}
              {investFormData.type === 'Sponsorship' && (
                <>
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={investFormData.name}
                      onChange={(e) => setInvestFormData({...investFormData, name: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={investFormData.email}
                        onChange={(e) => setInvestFormData({...investFormData, email: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
                      <input
                        type="tel"
                        value={investFormData.phone}
                        onChange={(e) => setInvestFormData({...investFormData, phone: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Office Phone and WhatsApp */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Office Phone</label>
                      <input
                        type="tel"
                        value={investFormData.officePhone}
                        onChange={(e) => setInvestFormData({...investFormData, officePhone: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">WhatsApp</label>
                      <input
                        type="tel"
                        value={investFormData.whatsapp}
                        onChange={(e) => setInvestFormData({...investFormData, whatsapp: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Logo */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Logo</label>
                    <div className="flex items-center flex-wrap gap-2">
                      <input
                        type="file"
                        onChange={(e) => setInvestFormData({...investFormData, logoFile: e.target.files?.[0] || null})}
                        className="hidden"
                        id="sponsorLogoFile"
                        accept=".jpg,.jpeg,.png,.svg"
                      />
                      <label
                        htmlFor="sponsorLogoFile"
                        className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        Choose File
                      </label>
                      <span className="text-sm text-gray-600">
                        {investFormData.logoFile ? investFormData.logoFile.name : 'No file chosen'}
                      </span>
                    </div>
                  </div>

                  {/* Motto */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Motto</label>
                    <input
                      type="text"
                      value={investFormData.motto}
                      onChange={(e) => setInvestFormData({...investFormData, motto: e.target.value})}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Special Packages */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Special Packages</label>
                    <textarea
                      value={investFormData.specialPackages}
                      onChange={(e) => setInvestFormData({...investFormData, specialPackages: e.target.value})}
                      rows={3}
                      placeholder="Describe special packages..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Messages */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Messages</label>
                    <textarea
                      value={investFormData.messages}
                      onChange={(e) => setInvestFormData({...investFormData, messages: e.target.value})}
                      rows={3}
                      placeholder="Type your message..."
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  {/* Effective Date and Expiry Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Effective Date</label>
                      <input
                        type="date"
                        value={investFormData.effectiveDate}
                        onChange={(e) => setInvestFormData({...investFormData, effectiveDate: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                      <input
                        type="date"
                        value={investFormData.expiryDate}
                        onChange={(e) => setInvestFormData({...investFormData, expiryDate: e.target.value})}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* MOU Signed and Contract Signed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">MOU Signed</label>
                      <div className="flex items-center flex-wrap gap-2">
                        <input
                          type="file"
                          onChange={(e) => setInvestFormData({...investFormData, mouSignedFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="sponsorMouFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="sponsorMouFile"
                          className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {investFormData.mouSignedFile ? investFormData.mouSignedFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contract Signed</label>
                      <div className="flex items-center flex-wrap gap-2">
                        <input
                          type="file"
                          onChange={(e) => setInvestFormData({...investFormData, contractSignedFile: e.target.files?.[0] || null})}
                          className="hidden"
                          id="sponsorContractFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="sponsorContractFile"
                          className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          Choose File
                        </label>
                        <span className="text-sm text-gray-600">
                          {investFormData.contractSignedFile ? investFormData.contractSignedFile.name : 'No file chosen'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvestPartnerPage;
