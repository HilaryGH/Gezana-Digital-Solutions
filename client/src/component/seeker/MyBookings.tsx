import { useEffect, useState } from "react";
import axios from "../../api/axios";

interface Provider {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

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
    provider?: Provider;
  };
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState("");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<Booking[]>("/bookings/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBookings();
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditId(booking._id);
    setEditNote(booking.note || "");
    setEditDate(booking.date);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/bookings/${editId}`,
        { note: editNote, date: editDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditId(null);
      fetchBookings();
    } catch (err) {
      alert("Update failed");
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
      <h2 className="text-2xl font-bold mb-6 mt-12 text-center text-orange-600">
        My Bookings
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
                Provider
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
                  <div className="text-xs text-gray-500">
                    {booking.service?.price ? `${booking.service.price} ETB` : "—"}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {editId === booking._id ? (
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="border p-1 rounded"
                    />
                  ) : (
                    new Date(booking.date).toLocaleDateString()
                  )}
                </td>

                <td className="px-4 py-3">
                  <span className={getStatusBadge(booking.status)}>
                    {booking.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {booking.status === "confirmed" &&
                  booking.service?.provider ? (
                    <>
                      <div className="font-semibold">
                        {booking.service.provider.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {booking.service.provider.email}
                      </div>
                      {booking.service.provider.phone && (
                        <div className="text-xs text-gray-600">
                          {booking.service.provider.phone}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>

                <td className="px-4 py-3">
                  {editId === booking._id ? (
                    <input
                      type="text"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    booking.note || "—"
                  )}
                </td>

                <td className="px-4 py-3 space-x-2">
                  {editId === booking._id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(booking)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
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

export default MyBookings;
