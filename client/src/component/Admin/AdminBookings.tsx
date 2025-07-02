import { useEffect, useState } from "react";
import axios from "../../api/axios";

interface User {
  name: string;
  email: string;
  phone?: string;
}

interface Category {
  name: string;
}

interface Provider {
  name: string;
  email?: string;
}

interface Service {
  name: string;
  category: Category;
  provider: Provider;
}

interface Booking {
  _id: string;
  user: User;
  service: Service;
  date: string;
  status: string;
  createdAt: string;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get<Booking[]>("/bookings/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
        setFilteredBookings(res.data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch bookings", err);
        setError(err.response?.data?.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Filter bookings on search
  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = bookings.filter((b) =>
      [
        b.user?.name,
        b.user?.email,
        b.user?.phone,
        b.service?.name,
        b.service?.category?.name,
        b.service?.provider?.name,
        b.status,
      ].some((val) => val?.toLowerCase().includes(query))
    );
    setFilteredBookings(filtered);
  }, [search, bookings]);

  const handleConfirm = async (id: string) => {
    if (!confirm("Confirm this booking?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/bookings/${id}/confirm`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "confirmed" } : b))
      );
    } catch {
      alert("Failed to confirm booking.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch {
      alert("Failed to delete booking.");
    }
  };

  if (loading) return <p className="p-6">Loading bookings...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-orange-700">All Bookings</h2>

      {/* Search Input */}
      <div className="mb-4 max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, service, provider..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 focus:outline-none text-sm"
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Booking Table */}
      {filteredBookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white shadow-md rounded-md overflow-hidden text-sm">
            <thead className="bg-orange-100 text-orange-800">
              <tr>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">Service</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Provider</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Booked At</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="border-t hover:bg-orange-50">
                  <td className="py-2 px-4">{booking.user?.name || "N/A"}</td>
                  <td className="py-2 px-4">{booking.user?.email || "N/A"}</td>
                  <td className="py-2 px-4">{booking.user?.phone || "-"}</td>
                  <td className="py-2 px-4">
                    {booking.service?.name || "N/A"}
                  </td>
                  <td className="py-2 px-4">
                    {booking.service?.category?.name || "N/A"}
                  </td>
                  <td className="py-2 px-4">
                    {booking.service?.provider?.name || "N/A"}
                  </td>
                  <td className="py-2 px-4">
                    {booking.date
                      ? new Date(booking.date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="py-2 px-4 capitalize">
                    {booking.status || "N/A"}
                  </td>
                  <td className="py-2 px-4">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    {booking.status !== "confirmed" && (
                      <button
                        onClick={() => handleConfirm(booking._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(booking._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
