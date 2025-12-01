import { useState, useEffect } from "react";
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
  const [memberships, setMemberships] = useState<PremiumMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedMembership, setSelectedMembership] = useState<PremiumMembership | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
        setMemberships(response.data.memberships);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Premium Memberships</h1>
            <button
              onClick={fetchMemberships}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>

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
                      Date
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
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMembership(membership);
                              setShowDetails(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={membership.status}
                            onChange={(e) => handleUpdateStatus(membership._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
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
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                          <button
                            onClick={() => handleDelete(membership._id)}
                            className="text-red-600 hover:text-red-900"
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
            <div className="mt-6 flex justify-end">
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
    </div>
  );
};

export default PremiumMemberships;








