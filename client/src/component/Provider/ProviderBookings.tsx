import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { User, Mail, Phone, MapPin, Calendar, Clock, DollarSign, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Booking {
  _id: string;
  date: string;
  time?: string;
  note?: string;
  status: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service?: {
    _id: string;
    name: string;
    price?: number;
  };
  createdAt?: string;
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
    const base = "px-3 py-1.5 text-sm rounded-full font-semibold inline-flex items-center gap-2";
    if (status === "confirmed") return `${base} bg-green-100 text-green-700`;
    if (status === "cancelled") return `${base} bg-red-100 text-red-700`;
    if (status === "completed") return `${base} bg-blue-100 text-blue-700`;
    return `${base} bg-yellow-100 text-yellow-700`;
  };

  const getStatusIcon = (status: string) => {
    if (status === "confirmed") return <CheckCircle size={16} />;
    if (status === "cancelled") return <XCircle size={16} />;
    if (status === "completed") return <CheckCircle size={16} />;
    return <AlertCircle size={16} />;
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading bookings...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Bookings</h1>
          <p className="text-gray-600">Manage your service bookings and customer details</p>
          <div className="mt-4 flex gap-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Total Bookings: </span>
              <span className="font-bold text-orange-600">{bookings.length}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Pending: </span>
              <span className="font-bold text-yellow-600">{bookings.filter(b => b.status === 'pending').length}</span>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Confirmed: </span>
              <span className="font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</span>
            </div>
          </div>
        </div>

      {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600">When customers book your services, they'll appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Customer Details */}
                    <div className="md:col-span-1">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Customer Details</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <User className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-semibold text-gray-900">
                              {booking.fullName || booking.user?.name || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Mail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900 break-all">
                              {booking.email || booking.user?.email || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">
                              {booking.phone || booking.user?.phone || "Not provided"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium text-gray-900">
                              {booking.address || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="md:col-span-1">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Booking Details</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Service</p>
                            <p className="font-semibold text-gray-900">
                  {booking.service?.name || "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        {booking.time && (
                          <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Time</p>
                              <p className="font-medium text-gray-900">{booking.time}</p>
                            </div>
                          </div>
                        )}
                        {booking.service?.price && (
                          <div className="flex items-start gap-3">
                            <DollarSign className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Price</p>
                              <p className="font-semibold text-green-600">
                                ${booking.service.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                        {booking.note && (
                          <div className="flex items-start gap-3">
                            <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500">Note</p>
                              <p className="font-medium text-gray-700 italic">"{booking.note}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="md:col-span-1">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Status & Actions</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Current Status</p>
                  <span className={getStatusBadge(booking.status)}>
                            {getStatusIcon(booking.status)}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                        </div>
                        
                        {booking.createdAt && (
                          <div>
                            <p className="text-sm text-gray-500">Booked On</p>
                            <p className="font-medium text-gray-700 text-sm">
                              {new Date(booking.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}

                  {booking.status === "pending" && (
                          <div className="space-y-2 pt-4">
                            <p className="text-sm text-gray-500 mb-2">Actions</p>
                      <button
                              onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={16} />
                              Confirm Booking
                      </button>
                      <button
                              onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <XCircle size={16} />
                              Cancel Booking
                      </button>
                          </div>
                        )}

                        {booking.status === "confirmed" && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                            <p className="text-sm text-green-800 font-medium">
                              ✓ Booking confirmed! Contact the customer to coordinate.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderBookings;
