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
  Briefcase,
  Handshake,
  UserPlus,
} from "lucide-react";
import { getAllBookings, type BookingWithDetails } from "../../api/bookings";
import axios from "../../api/axios";
import { getCardImageUrl } from "../../utils/imageHelper";
import { useNavigate } from "react-router-dom";
import AdminTeamMembers from "../Admin/AdminTeamMembers";

interface SuperadminStats {
  totalUsers: number;
  totalProviders: number;
  totalAgents: number;
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

interface AgentSubmittedProfessional {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  telegram?: string;
  city?: string;
  location?: string;
  serviceType?: string;
  notes?: string;
  status: string;
  photo?: string;
  idAttachment?: string;
  idDocumentType?: string;
  createdAt: string;
  agent?: { _id: string; name?: string; email?: string; phone?: string } | null;
}

const ID_DOC_LABELS: Record<string, string> = {
  fayda: "Fayda",
  kebele_id: "Kebele ID",
  driving_licence: "Driving licence",
  passport: "Passport",
};

const formatVerificationStatus = (status: string) => {
  if (status === "approved") return "Verified";
  if (status === "rejected") return "Rejected";
  return "Pending";
};

const managedUserRoleBadgeClass = (role: string) => {
  switch (role) {
    case "superadmin":
      return "bg-purple-100 text-purple-700";
    case "admin":
      return "bg-red-100 text-red-700";
    case "support":
      return "bg-blue-100 text-blue-700";
    case "marketing":
      return "bg-pink-100 text-pink-700";
    case "STANDARD_AGENT":
      return "bg-teal-100 text-teal-800";
    case "SUPER_ELITE_AGENT":
      return "bg-amber-100 text-amber-900";
    case "agent":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatManagedUserRoleLabel = (role: string) => {
  switch (role) {
    case "STANDARD_AGENT":
      return "Standard Agent";
    case "SUPER_ELITE_AGENT":
      return "Super / Elite Agent";
    case "agent":
      return "Agent";
    default:
      return role.replace(/_/g, " ").toUpperCase();
  }
};

const SuperadminDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SuperadminStats>({
    totalUsers: 0,
    totalProviders: 0,
    totalAgents: 0,
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
  const [agentProfessionals, setAgentProfessionals] = useState<AgentSubmittedProfessional[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [agentProSearch, setAgentProSearch] = useState("");
  const [showAgentProfessionals, setShowAgentProfessionals] = useState(false);
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

      // Fetch booking counts (more efficient than fetching all bookings)
      let totalBookingsCount = 0;
      let pendingBookingsCount = 0;
      let bookingsData: BookingWithDetails[] = [];
      
      try {
        const countResponse = await axios.get("/bookings/count", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (countResponse.data) {
          totalBookingsCount = countResponse.data.total || 0;
          pendingBookingsCount = countResponse.data.pending || 0;
          console.log("Fetched booking counts:", { total: totalBookingsCount, pending: pendingBookingsCount });
        }
      } catch (error: any) {
        console.error("Error fetching booking count:", error);
        // Fallback: try to fetch all bookings and count them
        try {
          const bookingsResponse = await axios.get("/bookings/all", {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Handle different response formats - backend returns direct array
          if (Array.isArray(bookingsResponse.data)) {
            bookingsData = bookingsResponse.data;
          } else if (bookingsResponse.data?.bookings && Array.isArray(bookingsResponse.data.bookings)) {
            bookingsData = bookingsResponse.data.bookings;
          } else if (bookingsResponse.data?.data && Array.isArray(bookingsResponse.data.data)) {
            bookingsData = bookingsResponse.data.data;
          }
          totalBookingsCount = bookingsData.length;
          pendingBookingsCount = bookingsData.filter((b: BookingWithDetails) => b.status === "pending").length;
          setBookings(bookingsData);
          console.log("Fetched bookings (fallback):", bookingsData.length);
        } catch (fallbackError) {
          console.error("Fallback booking fetch also failed:", fallbackError);
          setBookings([]);
        }
      }

      // Fetch all bookings for display (if needed)
      try {
        const bookingsResponse = await axios.get("/bookings/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Handle different response formats - backend returns direct array
        if (Array.isArray(bookingsResponse.data)) {
          bookingsData = bookingsResponse.data;
        } else if (bookingsResponse.data?.bookings && Array.isArray(bookingsResponse.data.bookings)) {
          bookingsData = bookingsResponse.data.bookings;
        } else if (bookingsResponse.data?.data && Array.isArray(bookingsResponse.data.data)) {
          bookingsData = bookingsResponse.data.data;
        }
        setBookings(bookingsData);
      } catch (error: any) {
        console.error("Error fetching bookings list:", error);
        // Try alternative method
        try {
          bookingsData = await getAllBookings();
          setBookings(bookingsData);
        } catch (altError) {
          console.error("Alternative booking fetch also failed:", altError);
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
          const price =
            b.bookingKind === "professional"
              ? Number(b.professionalPrice || 0)
              : b.service?.price || 0;
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
      const totalAgents = allUsers.filter(u =>
        ["agent", "STANDARD_AGENT", "SUPER_ELITE_AGENT"].includes(u.role)
      ).length;
      const totalAdmins = allUsers.filter(u => u.role === "admin").length;
      const totalSupport = allUsers.filter(u => u.role === "support").length;
      const totalMarketing = allUsers.filter(u => u.role === "marketing").length;

      // Staff + agents (Standard / Super-Elite / legacy agent) for superadmin user management
      const adminUsersList = allUsers.filter(u =>
        [
          "admin",
          "superadmin",
          "support",
          "marketing",
          "agent",
          "STANDARD_AGENT",
          "SUPER_ELITE_AGENT",
        ].includes(u.role)
      );
      setAdminUsers(adminUsersList);

      try {
        const apRes = await axios.get<{ professionals: AgentSubmittedProfessional[] }>(
          "/agents/superadmin/agent-professionals",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAgentProfessionals(apRes.data?.professionals || []);
      } catch (e: any) {
        if (e?.response?.status !== 403) {
          console.error("Error fetching agent-submitted professionals:", e);
        }
        setAgentProfessionals([]);
      }

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

      // Use count from API if available, otherwise use bookingsData length
      const finalTotalBookings = totalBookingsCount > 0 ? totalBookingsCount : (Array.isArray(bookingsData) ? bookingsData.length : 0);
      const finalTotalRevenue = typeof totalRevenue === 'number' ? totalRevenue : 0;
      const finalPendingBookings = pendingBookingsCount > 0 ? pendingBookingsCount : (Array.isArray(bookingsData) 
        ? bookingsData.filter(b => b.status === "pending").length 
        : 0);

      console.log("Setting stats:", {
        totalBookings: finalTotalBookings,
        totalRevenue: finalTotalRevenue,
        pendingBookings: finalPendingBookings
      });

      setStats({
        totalUsers,
        totalProviders,
        totalAgents,
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

  const filteredAgentProfessionals = agentProfessionals.filter((p) => {
    const q = agentProSearch.trim().toLowerCase();
    if (!q) return true;
    const ag = p.agent && typeof p.agent === "object" ? p.agent : null;
    const agentName = (ag?.name || "").toLowerCase();
    const agentEmail = (ag?.email || "").toLowerCase();
    return (
      (p.fullName || "").toLowerCase().includes(q) ||
      (p.phone || "").toLowerCase().includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.serviceType || "").toLowerCase().includes(q) ||
      (p.city || "").toLowerCase().includes(q) ||
      agentName.includes(q) ||
      agentEmail.includes(q)
    );
  });

  const providerBookingsCount = bookings.filter((b) => b.bookingKind === "service").length;
  const agentBookingsCount = bookings.filter(
    (b) => b.bookingKind === "professional" || (!!b.agent && typeof b.agent === "object")
  ).length;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Agents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAgents}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Handshake className="w-6 h-6 text-teal-700" />
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
                <h2 className="text-2xl font-bold text-gray-900">User management</h2>
                <p className="text-gray-600 mt-1">
                  Admin, support, marketing, and agent accounts (including Standard and Super / Elite)
                </p>
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
                  placeholder="Search users by name, email, or role..."
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
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${managedUserRoleBadgeClass(
                              user.role
                            )}`}
                          >
                            {formatManagedUserRoleLabel(user.role)}
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
                <p className="text-gray-600">No matching users found</p>
              </div>
            )}
          </div>
        </div>

        {/* Agent-submitted professionals */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                  <UserPlus className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Agent-submitted professionals</h2>
                  <p className="text-gray-600 mt-1">
                    Leads and listings added by agents ({agentProfessionals.length} total)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAgentProfessionals((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors font-medium"
              >
                {showAgentProfessionals ? "Hide listed professionals" : `See listed professionals (${agentProfessionals.length})`}
              </button>
            </div>
          </div>
          {showAgentProfessionals && (
          <div className="p-6">
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, agent, service type..."
                  value={agentProSearch}
                  onChange={(e) => setAgentProSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse" />
                ))}
              </div>
            ) : filteredAgentProfessionals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-700 w-14">Photo</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Professional</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Contact</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Services</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Submitted by agent</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Location</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">ID document</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgentProfessionals.map((p) => {
                      const img = p.photo ? getCardImageUrl(p.photo) : null;
                      return (
                        <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                          <td className="py-3 px-3">
                            {img ? (
                              <img
                                src={img}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">
                                {(p.fullName || "?").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 font-medium text-gray-900">{p.fullName}</td>
                          <td className="py-3 px-3 text-gray-600">
                            <div className="space-y-0.5">
                              <div>{p.phone}</div>
                              {p.email && <div className="text-xs">{p.email}</div>}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-600 max-w-[200px]">
                            <span className="line-clamp-3">{p.serviceType || "—"}</span>
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {p.agent && typeof p.agent === "object" ? (
                              <div className="space-y-0.5">
                                <div className="font-medium text-gray-800">{p.agent.name || "—"}</div>
                                <div className="text-xs">{p.agent.email || ""}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {[p.city, p.location].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="py-3 px-3 text-gray-600">
                            {p.idAttachment ? (
                              <div className="space-y-1 max-w-[10rem]">
                                <div className="text-xs text-gray-500">
                                  {p.idDocumentType
                                    ? ID_DOC_LABELS[p.idDocumentType] || p.idDocumentType
                                    : "—"}
                                </div>
                                <a
                                  href={getCardImageUrl(p.idAttachment) || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-semibold text-teal-700 hover:underline"
                                >
                                  View
                                </a>
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                p.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : p.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {formatVerificationStatus(p.status)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {agentProfessionals.length === 0
                    ? "No agent-submitted professionals yet, or you may not have access to this list."
                    : "No rows match your search."}
                </p>
              </div>
            )}
          </div>
          )}
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
            <p className="text-sm text-gray-600 mb-3">View and manage all bookings by category</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                Provider: {providerBookingsCount}
              </span>
              <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-700 font-medium">
                Agent: {agentBookingsCount}
              </span>
            </div>
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

          <button
            onClick={() => navigate("/admin/investments")}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:from-orange-200 group-hover:to-blue-200 transition-colors">
              <Handshake className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Investments & Partnerships</h3>
            <p className="text-sm text-gray-600">Manage investment and partnership applications</p>
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











