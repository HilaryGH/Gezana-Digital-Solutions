import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

type ProfessionalsCommunityFormState = {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  currentLocation: string;
  specialization: string;
  internshipPeriod: string;
  cv: File | null;
  credentials: File | null;
};

const ProfessionalsCommunityForm: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<ProfessionalsCommunityFormState>({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    linkedin: "",
    currentLocation: "",
    specialization: "",
    internshipPeriod: "",
    cv: null,
    credentials: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const specializationOptions = [
    "taskers",
    "education and training",
    "technology and design",
    "business and operations",
    "intern",
  ];

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "cv" | "credentials"
  ) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, [key]: file }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim()) return setError("Full Name is required.");
    if (!form.email.trim()) return setError("Email is required.");
    if (!form.phone.trim()) return setError("Phone is required.");
    if (!form.currentLocation.trim())
      return setError("Current Location is required.");
    if (!form.specialization.trim())
      return setError("Please select Specialization.");
    if (form.specialization === "intern" && !form.internshipPeriod.trim()) {
      return setError("Internship Period is required for Interns.");
    }
    if (!form.cv) return setError("Please upload your CV.");
    if (!form.credentials)
      return setError("Please upload your Credentials.");

    // Frontend-only submission (no backend/API calls).
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50/30 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Professionals Community
          </h1>
          <p className="text-lg text-gray-600">
            Join us by filling the form below
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          {/* Tag chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-7">
            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-1.5 rounded-full text-sm font-semibold">
              Taskers
            </span>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-1.5 rounded-full text-sm font-semibold">
              Fresh Graduate
            </span>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5">
                <span className="text-3xl" aria-hidden>
                  ✅
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Request received!
              </h2>
              <p className="text-gray-600 mb-7">
                Thanks for joining. We&apos;ll reach out to you soon.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  className="px-6 py-3 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  onClick={() => {
                    setSuccess(false);
                    setForm({
                      fullName: "",
                      email: "",
                      phone: "",
                      whatsapp: "",
                      linkedin: "",
                      currentLocation: "",
                      specialization: "",
                      cv: null,
                      credentials: null,
                    });
                    setError(null);
                  }}
                >
                  Submit another
                </button>
                <Link
                  to="/"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              {/* Phone + WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    placeholder="Phone"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    WhatsApp{" "}
                    <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    placeholder="WhatsApp (Optional)"
                  />
                </div>
              </div>

              {/* LinkedIn + Current Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn Profile{" "}
                    <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={form.linkedin}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, linkedin: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    placeholder="LinkedIn Profile (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Location{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.currentLocation}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        currentLocation: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                    placeholder="Current Location"
                    required
                  />
                </div>
              </div>

              {/* Specialization */}
              <div>
            <div className="block text-sm font-semibold text-gray-700 mb-2">
              -- Select Specialization -- <span className="text-red-500">*</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {specializationOptions.map((opt) => {
                const isSelected = form.specialization === opt;
                const label =
                  opt === "intern"
                    ? "Intern"
                    : opt === "taskers"
                      ? "Taskers"
                      : opt;
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-gray-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="specialization"
                      value={opt}
                      checked={isSelected}
                      onChange={() => {
                        setForm((prev) => ({
                          ...prev,
                          specialization: opt,
                          internshipPeriod:
                            opt === "intern" ? prev.internshipPeriod : "",
                        }));
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Conditional: internship details */}
          {form.specialization === "intern" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Internship Period{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.internshipPeriod}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    internshipPeriod: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                placeholder="e.g. June–August 2025"
                required
              />
              </div>
          )}

              {/* Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload CV <span className="text-red-500">*</span>
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, "cv")}
                      required
                    />
                    <span className="text-2xl" aria-hidden>
                      📄
                    </span>
                    <span className="text-sm text-gray-600">
                      {form.cv ? form.cv.name : "No file chosen"}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Credentials{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => handleFileChange(e, "credentials")}
                      required
                    />
                    <span className="text-2xl" aria-hidden>
                      🗂️
                    </span>
                    <span className="text-sm text-gray-600">
                      {form.credentials
                        ? form.credentials.name
                        : "No file chosen"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  Submit
                </button>
              </div>
            </form>
          )}

          {/* Secondary action */}
          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalsCommunityForm;

