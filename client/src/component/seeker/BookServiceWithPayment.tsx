import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../../api/axios";

interface Category {
  _id: string;
  name: string;
}

interface Type {
  _id: string;
  name: string;
  category: string;
}

interface ServiceOption {
  _id: string;
  name: string;
  type: string;
  price: number;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CheckoutData {
  txRef: string;
  amount: number;
  first_name: string;
  email: string;
  description: string;
}

const BookServiceWithPayment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<Type[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(
    null
  );

  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  // Redirect to service details if serviceId is in URL
  useEffect(() => {
    const serviceIdFromUrl = searchParams.get('serviceId');
    if (serviceIdFromUrl) {
      navigate(`/service/${serviceIdFromUrl}`);
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, typeRes] = await Promise.all([
          axios.get<Category[]>("/categories"),
          axios.get<Type[]>("/types"),
        ]);
        setCategories(catRes.data);
        setTypes(typeRes.data);
      } catch (err) {
        console.error("Failed to fetch categories/types", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!category) {
      setFilteredTypes([]);
      setType("");
      return;
    }
    setFilteredTypes(types.filter((t) => t.category === category));
    setType("");
  }, [category, types]);

  useEffect(() => {
    if (!category || !type) {
      setServices([]);
      setServiceId("");
      setSelectedService(null);
      return;
    }
    (async () => {
      try {
        const res = await axios.get<ServiceOption[]>(
          `/services/by-filter?category=${category}&type=${type}`
        );
        setServices(res.data);
      } catch (err) {
        console.error("Failed to fetch services", err);
      }
    })();
  }, [category, type]);

  useEffect(() => {
    setSelectedService(services.find((s) => s._id === serviceId) || null);
  }, [serviceId, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to book a service.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        "/bookings",
        {
          category,
          type,
          serviceType: type,
          service: serviceId,
          date,
          note,
          paymentMethod,
          ...(referralCode ? { referralCode: referralCode.trim().toUpperCase() } : {}),
        },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 60000, // 60 seconds for production environments
        }
      );

      if (paymentMethod === "cash") {
        setMessage("Booking successful. Please pay in cash on delivery.");
        return;
      }

      const { data: user } = await axios.get<UserResponse>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const txRef = `gezana-${Date.now()}`;
      const amount = selectedService?.price || 100;
      const description = `Payment for ${selectedService?.name} on ${date}`;

      setCheckoutData({
        txRef,
        amount,
        first_name: user.name,
        email: user.email,
        description,
      });

      setMessage("Redirecting to payment...");
    } catch (err: any) {
      console.error('Booking error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      // Handle timeout errors specifically
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setMessage('The booking request timed out. The server may be slow. Please try again in a moment.');
      } else {
        setMessage(err.response?.data?.message || "Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-2 py-2">
      <div className="w-full max-w-md sm:max-w-lg bg-white p-6 sm:p-4 shadow-lg rounded-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-orange mb-6 text-center">
          Book a Service & Pay
        </h2>

        {message && (
          <div
            className={`mb-4 p-3 text-center rounded-md ${
              message.includes("Redirecting") || message.includes("successful")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Payment form */}
        {checkoutData ? (
          <form
            method="POST"
            action="https://api.chapa.co/v1/hosted/pay"
            className="space-y-4"
          >
            <input
              type="hidden"
              name="public_key"
              value="CHAPUBK_TEST-xxxxxxxx"
            />
            <input type="hidden" name="tx_ref" value={checkoutData.txRef} />
            <input type="hidden" name="amount" value={checkoutData.amount} />
            <input type="hidden" name="currency" value="ETB" />
            <input
              type="hidden"
              name="first_name"
              value={checkoutData.first_name}
            />
            <input type="hidden" name="email" value={checkoutData.email} />
            <input
              type="hidden"
              name="callback_url"
              value="http://localhost:5173/payment-success"
            />
            <input
              type="hidden"
              name="return_url"
              value="http://localhost:5173/payment-success"
            />
            <input
              type="hidden"
              name="customization[title]"
              value="HomeHub Pay"
            />
            <input
              type="hidden"
              name="customization[description]"
              value={checkoutData.description}
            />

            <button
              type="submit"
              className="w-full bg-orange text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition"
            >
              Go to Secure Payment
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg"
                required
                disabled={!filteredTypes.length}
              >
                <option value="">Select type</option>
                {filteredTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div>
              <label className="block text-sm font-medium mb-1">Service</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg"
                required
                disabled={!services.length}
              >
                <option value="">Select service</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} — ETB {s.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Preferred Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg"
                required
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Additional Notes
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg"
                placeholder="Optional instructions..."
                rows={3}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg"
                required
              >
                <option value="">Select payment method</option>
                <option value="online">
                  Online (Card, Wallet, Bank Transfer)
                </option>
                <option value="cash">Cash on Delivery</option>
              </select>
            </div>

            {/* Referral Code (Optional) */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-purple-600">🎁</span> Referral Code <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code if you have one"
                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase"
                style={{ textTransform: 'uppercase' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Have a referral code? Enter it here to support the person who referred you!
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Book & Continue"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default BookServiceWithPayment;
