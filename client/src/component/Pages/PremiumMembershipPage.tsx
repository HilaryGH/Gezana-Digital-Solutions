import { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";

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
    description: 'Holistic wellness playbook, accountability circles & partner perks.'
  },
  {
    id: 'individual-yearly',
    name: 'Individual Yearly',
    price: '1000',
    period: 'year',
    description: 'All monthly benefits plus 2 complimentary wellness retreat passes.'
  },
  {
    id: 'corporate-monthly',
    name: 'Corporate Monthly',
    price: '300',
    period: 'month',
    description: 'Employee wellness activation, HR wellness toolkits & analytics.'
  },
  {
    id: 'corporate-yearly',
    name: 'Corporate Yearly',
    price: '2500',
    period: 'year',
    description: 'All monthly benefits plus bespoke wellness strategy co-design.'
  }
];

const PremiumMembershipPage = () => {
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

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { selectedPlan, formData });
    alert('Thank you for your premium membership request! Our concierge will contact you soon.');
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      organization: '',
      role: '',
      renewalStatus: 'New Membership',
      wellnessGoals: ''
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Premium Community
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                Curated wellness circles, corporate innovation hubs, and exclusive access to the Wanaw concierge network.
              </p>
            </div>
          </div>
        </section>

        {/* Plan Selection Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Choose Your Subscription
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Pick the plan that aligns with your goals. You can upgrade or adjust your membership anytime with our community concierge.
              </p>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative bg-white rounded-2xl p-6 shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-2 border-2 ${
                    selectedPlan === plan.id
                      ? 'border-blue-600 shadow-xl scale-105'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {selectedPlan === plan.id && (
                    <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Selected
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-extrabold text-blue-600">{plan.price}</span>
                      <span className="text-gray-600">ETB / {plan.period}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{plan.description}</p>
                </div>
              ))}
            </div>

            {/* Form Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Premium Concierge Intake
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Share a few details and our concierge will design your onboarding pathway, including curated programs, wellness data dashboards, and in-person experiences.
                  </p>
                </div>

                {/* Selected Plan Snapshot */}
                {selectedPlanData && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-8 border-2 border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      Selected Plan Snapshot
                    </h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-extrabold text-blue-600">{selectedPlanData.price}</span>
                      <span className="text-gray-700">ETB / {selectedPlanData.period}</span>
                    </div>
                    <p className="text-sm text-gray-700">{selectedPlanData.description}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Organization / Company <span className="text-gray-500 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Role / Title <span className="text-gray-500 text-xs">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Renewal Status
                      </label>
                      <select
                        value={formData.renewalStatus}
                        onChange={(e) => setFormData({ ...formData, renewalStatus: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="New Membership">New Membership</option>
                        <option value="Renewal">Renewal</option>
                        <option value="Upgrade">Upgrade</option>
                        <option value="Downgrade">Downgrade</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Share your wellness goals or concierge requests
                    </label>
                    <textarea
                      value={formData.wellnessGoals}
                      onChange={(e) => setFormData({ ...formData, wellnessGoals: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Tell us about your wellness goals, specific needs, or any special requests..."
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Submit Premium Request
                    </button>
                  </div>
                </form>
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






