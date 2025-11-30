import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WomenInitiativeSurvey: React.FC<SurveyModalProps> = ({ isOpen, onClose }) => {
  const [selectedSurvey, setSelectedSurvey] = useState<string>("");
  const [survey1Data, setSurvey1Data] = useState({
    providerType: "",
    location: "",
    yearsInOperation: "",
    numberOfEmployees: "",
    currentBusinessModel: "",
    descriptionOfServices: "",
    revenueStreams: "",
    targetMarket: "",
    interestInNewBusinessModels: "",
    areasForInnovation: "",
    barriersToInnovation: "",
    currentExpansionPlans: "",
    desiredAreasForExpansion: "",
    challengesToExpansion: "",
    currentDigitalToolsUsed: "",
    trainingNeedsInDigitalLiteracy: "",
    preferredTrainingFormats: "",
    additionalSupportsNeeded: "",
    challengesNotAddressed: "",
    suggestionsForTrainingTopics: "",
  });

  const [survey2Data, setSurvey2Data] = useState({
    name: "",
    phone: "",
    email: "",
    age: "",
    maritalStatus: "",
    educationalBackground: "",
    occupation: "",
    areasCurrentlyInvolved: [] as string[],
    yearsOfExperience: "",
    specificSkillsPossessed: "",
    skillsNeedingImprovement: [] as string[],
    preferredTrainingFormat: "",
    preferredDuration: "",
    challengesInAccessingTraining: [] as string[],
    otherChallenges: "",
    additionalComments: "",
  });

  if (!isOpen) return null;

  const handleSurvey1Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSurvey1Data(prev => ({ ...prev, [name]: value }));
  };

  const handleSurvey2Change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'areasCurrentlyInvolved' || name === 'skillsNeedingImprovement' || name === 'challengesInAccessingTraining') {
        setSurvey2Data(prev => ({
          ...prev,
          [name]: checked
            ? [...(prev[name as keyof typeof prev] as string[]), value]
            : (prev[name as keyof typeof prev] as string[]).filter(item => item !== value)
        }));
      }
    } else {
      setSurvey2Data(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Survey submitted:", selectedSurvey === "survey1" ? survey1Data : survey2Data);
    alert("Survey submitted successfully! Thank you for your feedback.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-orange-600 text-white p-6 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold">Quick Survey</h2>
            <p className="text-blue-100 text-sm mt-1">Women's Initiative Surveys</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">Help us tailor programs by sharing your experience.</p>

          {/* Survey Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Survey
            </label>
            <select
              value={selectedSurvey}
              onChange={(e) => setSelectedSurvey(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              <option value="">Choose a survey...</option>
              <option value="survey1">Service Providers Capacity Building Survey</option>
              <option value="survey2">Underprivileged Women Training Needs Assessment</option>
            </select>
            {selectedSurvey && (
              <p className="text-sm text-orange-600 mt-2">⚠️ Survey is inactive.</p>
            )}
          </div>

          {/* Survey 1: Service Providers Capacity Building Survey */}
          {selectedSurvey === "survey1" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-200 pb-2">
                Service Providers Capacity Building Survey
              </h3>

              {/* Demographic Information */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Demographic Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Provider Type</label>
                    <input
                      type="text"
                      name="providerType"
                      value={survey1Data.providerType}
                      onChange={handleSurvey1Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location (city/state/region)</label>
                    <input
                      type="text"
                      name="location"
                      value={survey1Data.location}
                      onChange={handleSurvey1Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Years in Operation</label>
                    <select
                      name="yearsInOperation"
                      value={survey1Data.yearsInOperation}
                      onChange={handleSurvey1Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="0-1">0-1 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="11+">11+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Employees</label>
                    <select
                      name="numberOfEmployees"
                      value={survey1Data.numberOfEmployees}
                      onChange={handleSurvey1Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2-5">2-5</option>
                      <option value="6-10">6-10</option>
                      <option value="11-20">11-20</option>
                      <option value="21+">21+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Business Model</label>
                    <textarea
                      name="currentBusinessModel"
                      value={survey1Data.currentBusinessModel}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description of Services Offered</label>
                    <textarea
                      name="descriptionOfServices"
                      value={survey1Data.descriptionOfServices}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Revenue Streams</label>
                    <textarea
                      name="revenueStreams"
                      value={survey1Data.revenueStreams}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Market</label>
                    <textarea
                      name="targetMarket"
                      value={survey1Data.targetMarket}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Business Model Innovation */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Business Model Innovation</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Interest in New Business Models</label>
                    <select
                      name="interestInNewBusinessModels"
                      value={survey1Data.interestInNewBusinessModels}
                      onChange={handleSurvey1Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="very-interested">Very Interested</option>
                      <option value="somewhat-interested">Somewhat Interested</option>
                      <option value="not-interested">Not Interested</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Areas for Innovation</label>
                    <textarea
                      name="areasForInnovation"
                      value={survey1Data.areasForInnovation}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Barriers to Innovation</label>
                    <textarea
                      name="barriersToInnovation"
                      value={survey1Data.barriersToInnovation}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Expansion Strategies */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Expansion Strategies</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Expansion Plans</label>
                    <select
                      name="currentExpansionPlans"
                      value={survey1Data.currentExpansionPlans}
                      onChange={handleSurvey1Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="considering">Considering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Desired Areas for Expansion</label>
                    <textarea
                      name="desiredAreasForExpansion"
                      value={survey1Data.desiredAreasForExpansion}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Challenges to Expansion</label>
                    <textarea
                      name="challengesToExpansion"
                      value={survey1Data.challengesToExpansion}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Digital Literacy Needs */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Digital Literacy Needs</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Digital Tools Used</label>
                    <textarea
                      name="currentDigitalToolsUsed"
                      value={survey1Data.currentDigitalToolsUsed}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Training Needs in Digital Literacy</label>
                    <textarea
                      name="trainingNeedsInDigitalLiteracy"
                      value={survey1Data.trainingNeedsInDigitalLiteracy}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Training Formats</label>
                    <textarea
                      name="preferredTrainingFormats"
                      value={survey1Data.preferredTrainingFormats}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback and Suggestions */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Feedback and Suggestions</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Supports Needed</label>
                    <textarea
                      name="additionalSupportsNeeded"
                      value={survey1Data.additionalSupportsNeeded}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Challenges Not Addressed</label>
                    <textarea
                      name="challengesNotAddressed"
                      value={survey1Data.challengesNotAddressed}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Suggestions for Training Topics</label>
                    <textarea
                      name="suggestionsForTrainingTopics"
                      value={survey1Data.suggestionsForTrainingTopics}
                      onChange={handleSurvey1Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-gray-700">
                  We respect your privacy. Responses help us build impactful programs.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={true}
                  className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold cursor-not-allowed"
                >
                  Submit (Inactive)
                </button>
              </div>
            </form>
          )}

          {/* Survey 2: Underprivileged Women Training Needs Assessment */}
          {selectedSurvey === "survey2" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-200 pb-2">
                Underprivileged Women Training Needs Assessment
              </h3>

              {/* Demographic Information */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Demographic Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={survey2Data.name}
                      onChange={handleSurvey2Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={survey2Data.phone}
                      onChange={handleSurvey2Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-gray-500 text-xs">(Optional)</span></label>
                    <input
                      type="email"
                      name="email"
                      value={survey2Data.email}
                      onChange={handleSurvey2Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={survey2Data.age}
                      onChange={handleSurvey2Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Marital Status</label>
                    <select
                      name="maritalStatus"
                      value={survey2Data.maritalStatus}
                      onChange={handleSurvey2Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Educational Background</label>
                    <select
                      name="educationalBackground"
                      value={survey2Data.educationalBackground}
                      onChange={handleSurvey2Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="no-formal-education">No Formal Education</option>
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="high-school">High School</option>
                      <option value="vocational">Vocational</option>
                      <option value="university">University</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={survey2Data.occupation}
                      onChange={handleSurvey2Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Skills and Experience */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Skills and Experience</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Areas Currently Involved In</label>
                    <div className="space-y-2">
                      {["Infant Care", "Food Preparation", "Nutrition and Dietary Services", "Spa and Beauty Services", "Fashion and Design"].map((area) => (
                        <label key={area} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="areasCurrentlyInvolved"
                            value={area}
                            checked={survey2Data.areasCurrentlyInvolved.includes(area)}
                            onChange={handleSurvey2Change}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                    <input
                      type="text"
                      name="yearsOfExperience"
                      value={survey2Data.yearsOfExperience}
                      onChange={handleSurvey2Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specific Skills Possessed</label>
                    <textarea
                      name="specificSkillsPossessed"
                      value={survey2Data.specificSkillsPossessed}
                      onChange={handleSurvey2Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Training Needs */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Training Needs</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Skills Needing Improvement</label>
                    <div className="space-y-2">
                      {["Infant Care Techniques", "Healthy Cooking Practices", "Nutritional Knowledge", "Spa Treatments", "Beauty Techniques", "Fashion Design Skills"].map((skill) => (
                        <label key={skill} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="skillsNeedingImprovement"
                            value={skill}
                            checked={survey2Data.skillsNeedingImprovement.includes(skill)}
                            onChange={handleSurvey2Change}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Training Format</label>
                    <select
                      name="preferredTrainingFormat"
                      value={survey2Data.preferredTrainingFormat}
                      onChange={handleSurvey2Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="in-person">In-Person</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="workshop">Workshop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Duration</label>
                    <select
                      name="preferredDuration"
                      value={survey2Data.preferredDuration}
                      onChange={handleSurvey2Change}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none"
                    >
                      <option value="">Select</option>
                      <option value="1-day">1 Day</option>
                      <option value="1-week">1 Week</option>
                      <option value="2-weeks">2 Weeks</option>
                      <option value="1-month">1 Month</option>
                      <option value="3-months">3 Months</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Barriers and Challenges */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-gray-900 mb-4">Barriers and Challenges</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Challenges in Accessing Training</label>
                    <div className="space-y-2">
                      {["Lack of financial resources", "Transportation issues", "Time constraints (work/family)", "Lack of information about available programs"].map((challenge) => (
                        <label key={challenge} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="challengesInAccessingTraining"
                            value={challenge}
                            checked={survey2Data.challengesInAccessingTraining.includes(challenge)}
                            onChange={handleSurvey2Change}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{challenge}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Other Challenges</label>
                    <textarea
                      name="otherChallenges"
                      value={survey2Data.otherChallenges}
                      onChange={handleSurvey2Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Comments or Suggestions</label>
                    <textarea
                      name="additionalComments"
                      value={survey2Data.additionalComments}
                      onChange={handleSurvey2Change}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-pink-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-gray-700">
                  We respect your privacy. Responses help us build impactful programs.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={true}
                  className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold cursor-not-allowed"
                >
                  Submit (Inactive)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WomenInitiativeSurvey;

