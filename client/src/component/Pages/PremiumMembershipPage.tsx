import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../Footer";
import axios from "../../api/axios";

type PlanType = 'individual-monthly' | 'individual-yearly' | 'corporate-monthly' | 'corporate-yearly';

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  description: string;
}

const plans: Plan[] = [
  {
    id: 'individual-monthly',
    name: 'Individual Monthly',
    price: '100',
    period: 'month',
    description: 'Access to premium features, accountability circles & partner perks.'
  },
  {
    id: 'individual-yearly',
    name: 'Individual Yearly',
    price: '1000',
    period: 'year',
    description: 'All monthly benefits plus 2 complimentary retreat passes.'
  },
  {
    id: 'corporate-monthly',
    name: 'Corporate Monthly',
    price: '300',
    period: 'month',
    description: 'Employee activation, HR toolkits & analytics.'
  },
  {
    id: 'corporate-yearly',
    name: 'Corporate Yearly',
    price: '2500',
    period: 'year',
    description: 'All monthly benefits plus bespoke strategy co-design.'
  }
];

const PremiumMembershipPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('individual-monthly');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    renewalStatus: 'New Membership',
    wellnessGoals: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to submit a premium membership request");
        setLoading(false);
        return;
      }

      if (!selectedPlanData) {
        setError("Please select a plan");
        setLoading(false);
        return;
      }

      // Create premium membership request
      const response = await axios.post(
        "/premium-memberships",
        {
          planType: selectedPlan,
          planName: selectedPlanData.name,
          price: parseInt(selectedPlanData.price),
          period: selectedPlanData.period,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          organization: formData.organization,
          role: formData.role,
          renewalStatus: formData.renewalStatus,
          goals: formData.wellnessGoals,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Navigate to payment page with membership data
        navigate("/payment", {
          state: {
            type: "premium-membership",
            membership: response.data.membership,
            amount: parseInt(selectedPlanData.price),
            planName: selectedPlanData.name,
          },
        });
      }
    } catch (error: any) {
      console.error("Error submitting premium membership:", error);
      setError(
        error.response?.data?.message ||
        "Failed to submit premium membership request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Hero Section */}
        <section className="pt-24 pb-4 md:pt-28 md:pb-6 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          <div className="max-w-5xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                Premium Community
              </h1>
              <p className="text-sm md:text-base text-blue-100">
                Curated community circles, corporate innovation hubs, and exclusive access to our concierge network.
              </p>
            </div>
          </div>
        </section>

        {/* Plan Selection Section */}
        <section className="py-4 md:py-6">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                Choose Your Subscription
              </h2>
              <p className="text-xs md:text-sm text-gray-600 max-w-2xl mx-auto">
                Pick the plan that aligns with your goals. You can upgrade or adjust your membership anytime.
              </p>
            </div>

            {/* Side by Side Layout: Plans and Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Plan Cards Section - Left Side */}
              <div className="lg:sticky lg:top-8 lg:h-fit">
                <h3 className="text-base font-bold text-gray-900 mb-3">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative bg-white rounded-lg p-3 shadow-sm cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 border-2 ${
                        selectedPlan === plan.id
                          ? 'border-blue-600 shadow-md scale-[1.01]'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {selectedPlan === plan.id && (
                        <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                          Selected
                        </div>
                      )}
                      <div className="mb-2">
                        <h3 className="text-sm font-bold text-gray-900 mb-0.5">{plan.name}</h3>
                        <div className="flex items-baseline gap-1.5 mb-1">
                          <span className="text-lg font-extrabold text-blue-600">{plan.price}</span>
                          <span className="text-gray-600 text-[10px]">ETB / {plan.period}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-snug">{plan.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Section - Right Side */}
              <div>
                <div className="bg-white rounded-lg shadow-md p-4 md:p-5 border border-gray-100">
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                    Premium Concierge Intake
                  </h2>
                  <p className="text-xs text-gray-600">
                    Share a few details and our concierge will design your onboarding pathway.
                  </p>
                </div>

                {/* Selected Plan Snapshot */}
                {selectedPlanData && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 mb-4 border-2 border-blue-200">
                    <h3 className="text-[10px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Selected Plan Snapshot
                    </h3>
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-xl font-extrabold text-blue-600">{selectedPlanData.price}</span>
                      <span className="text-gray-700 text-xs">ETB / {selectedPlanData.period}</span>
                    </div>
                    <p className="text-[11px] text-gray-700">{selectedPlanData.description}</p>
                  </div>
                )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                        Organization / Company <span className="text-gray-500 text-[10px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                        Role / Title <span className="text-gray-500 text-[10px]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                        Renewal Status
                      </label>
                      <select
                        value={formData.renewalStatus}
                        onChange={(e) => setFormData({ ...formData, renewalStatus: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="New Membership">New Membership</option>
                        <option value="Renewal">Renewal</option>
                        <option value="Upgrade">Upgrade</option>
                        <option value="Downgrade">Downgrade</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                      Share your goals or concierge requests
                    </label>
                    <textarea
                      value={formData.wellnessGoals}
                      onChange={(e) => setFormData({ ...formData, wellnessGoals: e.target.value })}
                      rows={3}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Tell us about your goals, specific needs, or any special requests..."
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.01] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Submit Premium Request</span>
                      )}
                    </button>
                  </div>
                </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default PremiumMembershipPage;









