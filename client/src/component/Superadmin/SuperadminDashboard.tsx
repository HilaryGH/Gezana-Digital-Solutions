import { useState, useEffect } from "react";
import { 
  Shield, 
  Users, 
  Calendar, 
  Settings, 
  BarChart3,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Database,
  Server,
  Key,
  UserCog,
  FileText,
  Bell,
  Globe,
  Lock,
  RefreshCw,
  Download,
  Search,
  Filter,
  Briefcase
} from "lucide-react";
import { getAllBookings, type BookingWithDetails } from "../../api/bookings";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import AdminTeamMembers from "../Admin/AdminTeamMembers";

interface SuperadminStats {
  totalUsers: number;
  totalProviders: number;
  totalAdmins: number;
  totalSupport: number;
  totalMarketing: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  activeServices: number;
  systemHealth: string;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const SuperadminDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SuperadminStats>({
    totalUsers: 0,
    totalProviders: 0,
    totalAdmins: 0,
    totalSupport: 0,
    totalMarketing: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activeServices: 0,
    systemHealth: "healthy",
  });
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Superadmin");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUserName(user.name || "Superadmin");
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      // Fetch all bookings
      let bookingsData: BookingWithDetails[] = [];
      try {
        const bookingsResponse = await axios.get("/bookings/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Handle different response formats
        bookingsData = Array.isArray(bookingsResponse.data) 
          ? bookingsResponse.data 
          : bookingsResponse.data?.bookings || bookingsResponse.data?.data || [];
        setBookings(bookingsData);
        console.log("Fetched bookings:", bookingsData.length);
      } catch (error: any) {
        console.error("Error fetching bookings:", error);
        // Try alternative method
        try {
          bookingsData = await getAllBookings();
          setBookings(bookingsData);
          console.log("Fetched bookings (alternative):", bookingsData.length);
        } catch (altError) {
          console.error("Alternative booking fetch also failed:", altError);
          setBookings([]);
        }
      }

      // Calculate revenue from completed/confirmed bookings with paid status
      // Also include bookings that are paid regardless of status
      const totalRevenue = bookingsData
        .filter(b => {
          const isPaid = b.paymentStatus === "paid";
          const isCompletedOrConfirmed = (b.status === "completed" || b.status === "confirmed");
          return isPaid && (isCompletedOrConfirmed || b.status === "pending"); // Include pending paid bookings too
        })
        .reduce((sum, b) => {
          const price = b.service?.price || 0;
          return sum + price;
        }, 0);
      
      console.log("Total revenue calculated:", totalRevenue, "from", bookingsData.filter(b => b.paymentStatus === "paid").length, "paid bookings");

      // Fetch all users
      let allUsers: any[] = [];
      try {
        const usersResponse = await axios.get("/user/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        allUsers = usersResponse.data || [];
      } catch (e: any) {
        console.error("Error fetching users:", e);
        // Try alternative endpoint
        try {
          const usersResponse2 = await axios.get("/user", {
            headers: { Authorization: `Bearer ${token}` }
          });
          allUsers = usersResponse2.data || [];
        } catch (e2) {
          console.error("User endpoints not available");
        }
      }

      // Calculate user stats by role
      const totalUsers = allUsers.length;
      const totalProviders = allUsers.filter(u => u.role === "provider").length;
      const totalAdmins = allUsers.filter(u => u.role === "admin").length;
      const totalSupport = allUsers.filter(u => u.role === "support").length;
      const totalMarketing = allUsers.filter(u => u.role === "marketing").length;

      // Filter admin users (admin, superadmin, support, marketing)
      const adminUsersList = allUsers.filter(u => 
        ["admin", "superadmin", "support", "marketing"].includes(u.role)
      );
      setAdminUsers(adminUsersList);

      // Fetch services count
      let activeServices = 0;
      try {
        const servicesResponse = await axios.get("/services", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const services = servicesResponse.data.services || servicesResponse.data || [];
        activeServices = Array.isArray(services) 
          ? services.filter((s: any) => s.isActive !== false).length 
          : 0;
      } catch (e: any) {
        console.error("Error fetching services:", e);
      }

      // Ensure we have valid numbers
      const finalTotalBookings = Array.isArray(bookingsData) ? bookingsData.length : 0;
      const finalTotalRevenue = typeof totalRevenue === 'number' ? totalRevenue : 0;
      const finalPendingBookings = Array.isArray(bookingsData) 
        ? bookingsData.filter(b => b.status === "pending").length 
        : 0;

      console.log("Setting stats:", {
        totalBookings: finalTotalBookings,
        totalRevenue: finalTotalRevenue,
        pendingBookings: finalPendingBookings
      });

      setStats({
        totalUsers,
        totalProviders,
        totalAdmins,
        totalSupport,
        totalMarketing,
        totalBookings: finalTotalBookings,
        totalRevenue: finalTotalRevenue,
        pendingBookings: finalPendingBookings,
        activeServices,
        systemHealth: "healthy",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleExport = () => {
    try {
      const csvContent = [
        ["Name", "Email", "Role", "Status", "Created At"],
        ...filteredAdminUsers.map(user => [
          user.name,
          user.email,
          user.role,
          user.isActive ? "Active" : "Inactive",
          new Date(user.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `admin-users-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleEditUser = (user: AdminUser) => {
    // Navigate to user management page or show edit modal
    navigate(`/admin/user`, { state: { editUser: user } });
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.role === "superadmin") {
      alert("Cannot deactivate superadmin account");
      return;
    }

    if (!confirm(`Are you sure you want to deactivate ${user.name}? They will not be able to access the system.`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/user/${user._id}`, { isActive: false }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setAdminUsers(adminUsers.map(u => 
        u._id === user._id ? { ...u, isActive: false } : u
      ));
      alert("User deactivated successfully");
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      alert(error.response?.data?.message || "Failed to deactivate user. Please try again.");
    }
  };

  const formatCurrency = (amount: number) => {
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)} ETB`;
  };

  const filteredAdminUsers = adminUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {userName.substring(0, 2).toUpperCase() || "SA"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">Superadmin Dashboard</h1>
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-gray-600 mt-1">Welcome back, {userName} - Full System Access</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin-dashboard")}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Admin Panel</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">All platform users</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.pendingBookings} pending</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Active Services</p>
            <p className="text-3xl font-bold text-gray-900">{stats.activeServices.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Published services</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">System Health</p>
            <p className="text-3xl font-bold text-green-600">Healthy</p>
            <p className="text-xs text-gray-500 mt-1">All systems operational</p>
          </div>
        </div>

        {/* Role Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Providers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProviders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Support Staff</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSupport}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Marketing Team</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMarketing}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Users Management */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Users Management</h2>
                <p className="text-gray-600 mt-1">Manage all admin, support, and marketing accounts</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                </button>
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admin users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-gray-100 rounded-xl p-4 animate-pulse h-20"></div>
                ))}
              </div>
            ) : filteredAdminUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdminUsers.map((user) => (
                      <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "superadmin" ? "bg-purple-100 text-purple-700" :
                            user.role === "admin" ? "bg-red-100 text-red-700" :
                            user.role === "support" ? "bg-blue-100 text-blue-700" :
                            "bg-pink-100 text-pink-700"
                          }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" 
                              title="Edit"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                            {user.role !== "superadmin" && (
                              <button 
                                onClick={() => handleDeleteUser(user)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" 
                                title="Delete"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No admin users found</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <button
            onClick={() => navigate("/admin/user")}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage all platform users</p>
          </button>

          <button
            onClick={() => navigate("/admin/bookings")}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">All Bookings</h3>
            <p className="text-sm text-gray-600">View and manage all bookings</p>
          </button>

          <button
            onClick={() => navigate("/admin/services")}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
              <Settings className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Manage Services</h3>
            <p className="text-sm text-gray-600">Approve and manage services</p>
          </button>

          <button
            onClick={() => navigate("/admin/team-members")}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <UserCog className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Team Members</h3>
            <p className="text-sm text-gray-600">Manage team and permissions</p>
          </button>

          <button
            onClick={() => navigate("/admin/jobs", { state: { openForm: true } })}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Post Jobs</h3>
            <p className="text-sm text-gray-600">Create and manage job postings</p>
          </button>
          <button
            onClick={() => navigate("/admin/premium-memberships")}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Premium Memberships</h3>
            <p className="text-sm text-gray-600">Manage premium membership requests</p>
          </button>
        </div>

        {/* Team Members Management Section */}
        <div className="mb-8">
          <AdminTeamMembers />
        </div>

        {/* System Summary */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg border border-indigo-200 p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">System Overview</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5" />
                <p className="text-indigo-100 text-sm">Total Users</p>
              </div>
              <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5" />
                <p className="text-indigo-100 text-sm">Total Bookings</p>
              </div>
              <p className="text-3xl font-bold">{stats.totalBookings.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5" />
                <p className="text-indigo-100 text-sm">Total Revenue</p>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5" />
                <p className="text-indigo-100 text-sm">Admin Accounts</p>
              </div>
              <p className="text-3xl font-bold">{stats.totalAdmins + stats.totalSupport + stats.totalMarketing + 1}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;











