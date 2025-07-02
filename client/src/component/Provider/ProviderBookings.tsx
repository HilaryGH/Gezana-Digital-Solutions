import { useEffect, useState } from "react";
import axios from "../../api/axios";

interface Booking {
  _id: string;
  date: string;
  note?: string;
  status: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  service?: {
    _id: string;
    name: string;
    price?: number;
  };
}

const ProviderBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<Booking[]>("/provider/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Fetched bookings:", res.data);
      setBookings(res.data);
    } catch (err) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("token");

      const booking = bookings.find((b) => b._id === id);
      if (!booking || !booking.service?._id) {
        alert("Service info missing. Cannot update booking.");
        return;
      }

      await axios.put(
        `/bookings/${id}`,
        {
          status,
          service: booking.service._id, // Include service ID for validation
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchBookings(); // Refresh bookings after update
    } catch (err) {
      alert("Failed to update status");
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 text-xs rounded-full font-medium";
    if (status === "confirmed") return `${base} bg-green-100 text-green-700`;
    if (status === "cancelled") return `${base} bg-red-100 text-red-700`;
    return `${base} bg-yellow-100 text-yellow-700`;
  };

  if (loading) return <p className="text-center mt-10">Loading bookings...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg mt-10 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">
        Your Service Bookings
      </h2>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-500">No bookings yet.</p>
      ) : (
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-orange-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Service
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Seeker
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Note
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-orange-50">
                <td className="px-4 py-3 font-medium">
                  {booking.service?.name || "—"}
                </td>
                <td className="px-4 py-3">
                  {new Date(booking.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={getStatusBadge(booking.status)}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {booking.user?.name || "—"}
                  <br />
                  <span className="text-xs text-gray-500">
                    {booking.user?.email || "No email"}
                  </span>
                </td>
                <td className="px-4 py-3">{booking.note || "—"}</td>
                <td className="px-4 py-3 space-x-2">
                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusUpdate(booking._id, "confirmed")
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(booking._id, "cancelled")
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProviderBookings;
