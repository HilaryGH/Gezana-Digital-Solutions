import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MessageCircle, 
  Users, 
  Calendar, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  AlertCircle,
  FileText,
  Image,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  DollarSign,
  Save,
  X
} from "lucide-react";
import { getAllBookings, updateBooking, deleteBooking, type BookingWithDetails } from "../../api/bookings";
import axios from "../../api/axios";

interface SupportStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  totalUsers: number;
  activeTickets: number;
}

const CustomerSupportDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState<SupportStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    completedBookings: 0,
    totalUsers: 0,
    activeTickets: 0,
  });
  const [userName, setUserName] = useState("Support Agent");
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingWithDetails | null>(null);
  const [editFormData, setEditFormData] = useState({
    date: "",
    note: "",
    status: "",
    paymentStatus: "",
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        
        if (userData) {
          try {
            const user = JSON.parse(userData);
            setUserName(user.name || "Support Agent");
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }

        // Fetch all bookings
        const bookingsData = await getAllBookings();
        setBookings(bookingsData);

        // Calculate stats
        const totalBookings = bookingsData.length;
        const pendingBookings = bookingsData.filter(b => b.status === "pending").length;
        const confirmedBookings = bookingsData.filter(b => b.status === "confirmed").length;
        const cancelledBookings = bookingsData.filter(b => b.status === "cancelled").length;
        const completedBookings = bookingsData.filter(b => b.status === "completed").length;

        // Fetch user count (if endpoint exists)
        let totalUsers = 0;
        try {
          const usersResponse = await axios.get("/user/all", {
            headers: { Authorization: `Bearer ${token}` }
          });
          totalUsers = usersResponse.data.length || 0;
        } catch (e) {
          console.log("User count endpoint not available");
        }

        setStats({
          totalBookings,
          pendingBookings,
          confirmedBookings,
          cancelledBookings,
          completedBookings,
          totalUsers,
          activeTickets: pendingBookings, // Using pending bookings as active tickets
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this booking?`)) return;
    
    setActionLoading(bookingId);
    try {
      const token = localStorage.getItem("token");
      await updateBooking(bookingId, { status: newStatus });
      refreshData();
      alert(`Booking ${newStatus} successfully!`);
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      alert(error.response?.data?.message || `Failed to ${newStatus} booking`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePaymentStatusUpdate = async (bookingId: string, paymentStatus: string) => {
    setActionLoading(bookingId);
    try {
      await updateBooking(bookingId, { paymentStatus });
      refreshData();
      alert("Payment status updated successfully!");
    } catch (error: any) {
      console.error("Error updating payment status:", error);
      alert(error.response?.data?.message || "Failed to update payment status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (booking: BookingWithDetails) => {
    setEditingBooking(booking);
    setEditFormData({
      date: booking.date ? new Date(booking.date).toISOString().split("T")[0] : "",
      note: booking.note || "",
      status: booking.status || "pending",
      paymentStatus: booking.paymentStatus || "pending",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBooking) return;
    
    setActionLoading(editingBooking._id);
    try {
      const updateData: any = {};
      if (editFormData.date) {
        updateData.date = new Date(editFormData.date).toISOString();
      }
      if (editFormData.note !== undefined) {
        updateData.note = editFormData.note;
      }
      if (editFormData.status) {
        updateData.status = editFormData.status;
      }
      if (editFormData.paymentStatus) {
        updateData.paymentStatus = editFormData.paymentStatus;
      }
      
      await updateBooking(editingBooking._id, updateData);
      refreshData();
      setShowEditModal(false);
      setEditingBooking(null);
      alert("Booking updated successfully!");
    } catch (error: any) {
      console.error("Error updating booking:", error);
      alert(error.response?.data?.message || "Failed to update booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) return;
    
    setActionLoading(bookingId);
    try {
      await deleteBooking(bookingId);
      refreshData();
      alert("Booking deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      alert(error.response?.data?.message || "Failed to delete booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {userName.substring(0, 2).toUpperCase() || "CS"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Support Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Support Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tickets</p>
                <p className="text-3xl font-bold text-orange-600">{stats.activeTickets}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate("/admin/promotional-banners")}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
              <Image className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Promotional Banners</h3>
            <p className="text-sm text-gray-600">Create and manage promotional banners</p>
          </button>
        </div>

        {/* Bookings Management Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
                <p className="text-gray-600 mt-1">View and assist with customer bookings</p>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-gray-100 rounded-xl p-4 animate-pulse h-32"></div>
                ))}
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                  >
                    <div className="grid md:grid-cols-5 gap-4">
                      {/* Customer Info */}
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-2 font-semibold">CUSTOMER INFORMATION</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <p className="font-semibold text-gray-900">
                              {booking.user?.name || "N/A"}
                            </p>
                          </div>
                          {booking.user?.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">{booking.user.email}</p>
                            </div>
                          )}
                          {booking.user?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">{booking.user.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Service & Date */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-semibold">SERVICE DETAILS</p>
                        <div className="space-y-2">
                          <p className="font-medium text-gray-900">
                            {booking.service?.name || "N/A"}
                          </p>
                          {booking.category && (
                            <p className="text-sm text-gray-600">
                              Category: {typeof booking.category === 'string' ? booking.category : booking.category.name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {new Date(booking.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          {booking.service?.price && (
                            <p className="text-lg font-bold text-orange-600">
                              {booking.service.price} ETB
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Provider Info */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-semibold">PROVIDER</p>
                        <div className="space-y-2">
                          {booking.service?.provider ? (
                            <>
                              <p className="font-medium text-gray-900">
                                {typeof booking.service.provider === 'object' 
                                  ? booking.service.provider.name 
                                  : booking.service.provider}
                              </p>
                              {typeof booking.service.provider === 'object' && booking.service.provider.email && (
                                <p className="text-sm text-gray-600">
                                  {booking.service.provider.email}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">N/A</p>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2 font-semibold">STATUS & ACTIONS</p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {getStatusIcon(booking.status)}
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                            {booking.paymentStatus && (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                  booking.paymentStatus === "paid"
                                    ? "bg-green-100 text-green-700 border border-green-300"
                                    : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                }`}
                              >
                                <DollarSign className="w-3 h-3" />
                                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                              </span>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              onClick={() => handleViewDetails(booking)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                              title="View Details"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(booking)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium"
                              title="Edit Booking"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            
                            {/* Status Update Buttons */}
                            {booking.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                                  disabled={actionLoading === booking._id}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium disabled:opacity-50"
                                  title="Confirm Booking"
                                >
                                  {actionLoading === booking._id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                                  disabled={actionLoading === booking._id}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium disabled:opacity-50"
                                  title="Cancel Booking"
                                >
                                  {actionLoading === booking._id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                  Cancel
                                </button>
                              </>
                            )}
                            
                            {booking.status === "confirmed" && (
                              <button
                                onClick={() => handleStatusUpdate(booking._id, "completed")}
                                disabled={actionLoading === booking._id}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium disabled:opacity-50"
                                title="Mark as Completed"
                              >
                                {actionLoading === booking._id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3" />
                                )}
                                Complete
                              </button>
                            )}
                            
                            {/* Payment Status Update */}
                            {booking.paymentStatus === "pending" && booking.status !== "cancelled" && (
                              <button
                                onClick={() => handlePaymentStatusUpdate(booking._id, "paid")}
                                disabled={actionLoading === booking._id}
                                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium disabled:opacity-50"
                                title="Mark Payment as Paid"
                              >
                                {actionLoading === booking._id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <DollarSign className="w-3 h-3" />
                                )}
                                Mark Paid
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDelete(booking._id)}
                              disabled={actionLoading === booking._id}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium disabled:opacity-50"
                              title="Delete Booking"
                            >
                              {actionLoading === booking._id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              Delete
                            </button>
                          </div>
                          
                          {booking.note && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                                <p className="text-xs text-gray-600 italic line-clamp-2">
                                  "{booking.note}"
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No bookings available at the moment"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Summary */}
        <div className="mt-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg border border-blue-200 p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Support Overview</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Pending Actions</p>
                  <p className="text-3xl font-bold">{stats.pendingBookings}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Completed Today</p>
                  <p className="text-3xl font-bold">{stats.completedBookings}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Total Handled</p>
                  <p className="text-3xl font-bold">{stats.totalBookings}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportDashboard;











