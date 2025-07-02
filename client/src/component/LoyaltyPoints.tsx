import { useEffect, useState } from "react";
import axios from "../api/axios";

const LoyaltyPoints = () => {
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<{ loyaltyPoints: number }>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPoints(res.data.loyaltyPoints ?? 0);
      } catch (error) {
        console.error("Error fetching loyalty points", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-6">Loading your points...</p>
    );

  return (
    <div className="max-w-md mx-auto p-6 mt-30 bg-white rounded-xl shadow-md mt-8">
      <h2 className="text-xl font-semibold text-center text-blue-700 mb-4">
        🎁 Your Loyalty Points
      </h2>
      <p className="text-center text-3xl font-bold text-purple-600">
        {points} pts
      </p>
      <p className="text-center text-sm text-gray-500 mt-2">
        Earn more by booking services!
      </p>
    </div>
  );
};

export default LoyaltyPoints;
