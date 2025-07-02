import { useEffect, useState } from "react";
import axios from "../api/axios";

interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  seekerType?: string;
}

const PaymentPage = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<UserResponse>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user info", err);
        setError("Failed to load user info");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handlePayment = () => {
    if (!user) return;

    // Example payload for Chapa
    const chapaData = {
      amount: "100", // you can make this dynamic
      currency: "ETB",
      email: user.email,
      first_name: user.name,
      tx_ref: Date.now().toString(),
      callback_url: "http://localhost:5173/payment-success", // your frontend callback
      return_url: "http://localhost:5173/payment-success", // same or different
      customization: {
        title: "Service Payment",
        description: "Payment for your booked service",
      },
    };

    // Open Chapa payment modal (via their inline script if using client-side)
    const chapa = (window as any).ChapaCheckout;
    if (chapa) {
      chapa.init({ ...chapaData });
    } else {
      alert("Chapa script not loaded");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Proceed to Payment</h2>
      <p className="mb-2">Name: {user?.name}</p>
      <p className="mb-6">Email: {user?.email}</p>
      <button
        onClick={handlePayment}
        className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition"
      >
        Pay Now
      </button>
    </div>
  );
};

export default PaymentPage;
