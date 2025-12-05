import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Shield,
  RefreshCw,
  X,
  Save,
  FileText,
} from "lucide-react";

interface PremiumMembership {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  planType: string;
  planName: string;
  price: number;
  period: string;
  fullName: string;
  email: string;
  phone: string;
  organization?: string;
  role?: string;
  renewalStatus: string;
  goals?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;
  transactionId?: string;
  invoiceNumber?: string;
  status: "pending" | "active" | "expired" | "cancelled";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

const PremiumMemberships = () => {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<PremiumMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedMembership, setSelectedMembership] = useState<PremiumMembership | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMembership, setEditingMembership] = useState<PremiumMembership | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchMemberships();
  }, [statusFilter, paymentFilter]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (paymentFilter !== "all") params.append("paymentStatus", paymentFilter);

      const response = await axios.get(
        `/premium-memberships/admin/all?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const membershipsData = response.data.memberships || [];
        setMemberships(membershipsData);
        
        // Calculate stats
        const total = membershipsData.length;
        const active = membershipsData.filter((m: PremiumMembership) => m.status === "active").length;
        const pending = membershipsData.filter((m: PremiumMembership) => m.status === "pending").length;
        const expired = membershipsData.filter((m: PremiumMembership) => m.status === "expired").length;
        const totalRevenue = membershipsData
          .filter((m: PremiumMembership) => m.paymentStatus === "paid")
          .reduce((sum: number, m: PremiumMembership) => sum + (m.price || 0), 0);
        
        setStats({
          total,
          active,
          pending,
          expired,
          totalRevenue,
        });
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/premium-memberships/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchMemberships();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleUpdatePayment = async (id: string, paymentStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/premium-memberships/${id}/payment`,
        { paymentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchMemberships();
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this membership?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/premium-memberships/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchMemberships();
    } catch (error) {
      console.error("Error deleting membership:", error);
      alert("Failed to delete membership");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      expired: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const getPaymentBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const filteredMemberships = memberships.filter((membership) => {
    const matchesSearch =
      membership.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      membership.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      membership.planName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (membership: PremiumMembership) => {
    setEditingMembership(membership);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedData: Partial<PremiumMembership>) => {
    if (!editingMembership) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/premium-memberships/${editingMembership._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowEditModal(false);
      setEditingMembership(null);
      fetchMemberships();
      alert("Membership updated successfully");
    } catch (error) {
      console.error("Error updating membership:", error);
      alert("Failed to update membership");
    }
  };

  const handleViewInvoice = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/premium-memberships/${id}/invoice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        const invoice = response.data.invoice;
        const invoiceWindow = window.open("", "_blank");
        if (invoiceWindow) {
          invoiceWindow.document.write(`
            <html>
              <head>
                <title>Invoice ${invoice.invoiceNumber}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .invoice-details { margin: 20px 0; }
                  .section { margin: 20px 0; }
                  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                  th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                  .total { font-weight: bold; font-size: 1.2em; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>HomeHub Premium Membership Invoice</h1>
                  <p>Invoice #${invoice.invoiceNumber}</p>
                  <p>Date: ${new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <div class="section">
                  <h2>Customer Information</h2>
                  <p><strong>Name:</strong> ${invoice.customer.name}</p>
                  <p><strong>Email:</strong> ${invoice.customer.email}</p>
                  <p><strong>Phone:</strong> ${invoice.customer.phone}</p>
                  ${invoice.customer.organization ? `<p><strong>Organization:</strong> ${invoice.customer.organization}</p>` : ''}
                </div>
                <div class="section">
                  <h2>Plan Details</h2>
                  <p><strong>Plan:</strong> ${invoice.plan.name}</p>
                  <p><strong>Period:</strong> ${invoice.plan.period}</p>
                </div>
                <div class="section">
                  <h2>Payment Information</h2>
                  <p><strong>Status:</strong> ${invoice.payment.status}</p>
                  ${invoice.payment.method ? `<p><strong>Method:</strong> ${invoice.payment.method}</p>` : ''}
                  ${invoice.payment.transactionId ? `<p><strong>Transaction ID:</strong> ${invoice.payment.transactionId}</p>` : ''}
                </div>
                <div class="section">
                  <h2>Amount</h2>
                  <p class="total">Total: ${invoice.amount.total} ${invoice.amount.currency}</p>
                </div>
                <div class="section">
                  <h2>Membership Period</h2>
                  <p><strong>Start Date:</strong> ${invoice.dates.startDate ? new Date(invoice.dates.startDate).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>End Date:</strong> ${invoice.dates.endDate ? new Date(invoice.dates.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </body>
            </html>
          `);
          invoiceWindow.document.close();
        }
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      alert("Failed to load invoice");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/superadmin-dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4 transition-colors"
        >
          <X className="w-4 h-4 rotate-45" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-orange-600" />
                Premium Memberships Management
              </h1>
              <p className="text-gray-600 mt-1">Manage all premium membership requests and subscriptions</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Export to CSV
                  const csvContent = [
                    ["Name", "Email", "Phone", "Plan", "Price", "Status", "Payment Status", "Created Date"],
                    ...memberships.map(m => [
                      m.fullName,
                      m.email,
                      m.phone,
                      m.planName,
                      m.price.toString(),
                      m.status,
                      m.paymentStatus,
                      new Date(m.createdAt).toLocaleDateString()
                    ])
                  ].map(row => row.join(",")).join("\n");
                  
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  const url = URL.createObjectURL(blob);
                  link.setAttribute("href", url);
                  link.setAttribute("download", `premium-memberships-${new Date().toISOString().split('T')[0]}.csv`);
                  link.style.visibility = "hidden";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={fetchMemberships}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1">Total Memberships</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-1">Active</p>
              <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700 font-medium mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 font-medium mb-1">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-orange-900">{stats.totalRevenue.toLocaleString()} ETB</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Memberships Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredMemberships.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No memberships found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMemberships.map((membership) => (
                    <tr key={membership._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {membership.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{membership.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{membership.planName}</div>
                        <div className="text-sm text-gray-500 capitalize">{membership.period}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {membership.price} ETB
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            membership.status
                          )}`}
                        >
                          {membership.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(
                            membership.paymentStatus
                          )}`}
                        >
                          {membership.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(membership.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {membership.startDate && membership.endDate ? (
                          <div>
                            <div>{new Date(membership.startDate).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">to</div>
                            <div>{new Date(membership.endDate).toLocaleDateString()}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMembership(membership);
                              setShowDetails(true);
                            }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(membership)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <select
                            value={membership.status}
                            onChange={(e) => handleUpdateStatus(membership._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <select
                            value={membership.paymentStatus}
                            onChange={(e) =>
                              handleUpdatePayment(membership._id, e.target.value)
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                          <button
                            onClick={() => handleDelete(membership._id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Membership Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedMembership.fullName}</p>
                  <p><span className="font-medium">Email:</span> {selectedMembership.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedMembership.phone}</p>
                  {selectedMembership.organization && (
                    <p><span className="font-medium">Organization:</span> {selectedMembership.organization}</p>
                  )}
                  {selectedMembership.role && (
                    <p><span className="font-medium">Role:</span> {selectedMembership.role}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Plan Information</h3>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Plan:</span> {selectedMembership.planName}</p>
                  <p><span className="font-medium">Type:</span> {selectedMembership.planType}</p>
                  <p><span className="font-medium">Period:</span> {selectedMembership.period}</p>
                  <p><span className="font-medium">Price:</span> {selectedMembership.price} ETB</p>
                  <p><span className="font-medium">Renewal Status:</span> {selectedMembership.renewalStatus}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Status:</span> {selectedMembership.paymentStatus}</p>
                  {selectedMembership.paymentMethod && (
                    <p><span className="font-medium">Method:</span> {selectedMembership.paymentMethod}</p>
                  )}
                  {selectedMembership.transactionId && (
                    <p><span className="font-medium">Transaction ID:</span> {selectedMembership.transactionId}</p>
                  )}
                  {selectedMembership.invoiceNumber && (
                    <p><span className="font-medium">Invoice Number:</span> {selectedMembership.invoiceNumber}</p>
                  )}
                </div>
              </div>
              {selectedMembership.goals && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Goals/Requests</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedMembership.goals}</p>
                  </div>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dates</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Created:</span> {new Date(selectedMembership.createdAt).toLocaleString()}</p>
                  {selectedMembership.startDate && (
                    <p><span className="font-medium">Start Date:</span> {new Date(selectedMembership.startDate).toLocaleDateString()}</p>
                  )}
                  {selectedMembership.endDate && (
                    <p><span className="font-medium">End Date:</span> {new Date(selectedMembership.endDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {selectedMembership.invoiceNumber && (
                <button
                  onClick={() => handleViewInvoice(selectedMembership._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Invoice
                </button>
              )}
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Membership</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMembership(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <EditMembershipForm
              membership={editingMembership}
              onSave={handleSaveEdit}
              onCancel={() => {
                setShowEditModal(false);
                setEditingMembership(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Membership Form Component
const EditMembershipForm = ({
  membership,
  onSave,
  onCancel,
}: {
  membership: PremiumMembership;
  onSave: (data: Partial<PremiumMembership>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    status: membership.status,
    paymentStatus: membership.paymentStatus,
    paymentMethod: membership.paymentMethod || "",
    transactionId: membership.transactionId || "",
    startDate: membership.startDate ? new Date(membership.startDate).toISOString().split("T")[0] : "",
    endDate: membership.endDate ? new Date(membership.endDate).toISOString().split("T")[0] : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData: Partial<PremiumMembership> = {
      status: formData.status,
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod || undefined,
      transactionId: formData.transactionId || undefined,
    };

    if (formData.startDate) {
      updatedData.startDate = new Date(formData.startDate).toISOString();
    }
    if (formData.endDate) {
      updatedData.endDate = new Date(formData.endDate).toISOString();
    }

    onSave(updatedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            value={formData.paymentStatus}
            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select method</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Transaction ID
          </label>
          <input
            type="text"
            value={formData.transactionId}
            onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter transaction ID"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default PremiumMemberships;
















