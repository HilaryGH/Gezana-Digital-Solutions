import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Mail,
  Phone,
  Building,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  Handshake,
  Sparkles
} from "lucide-react";
import { getInvestments, updateInvestmentStatus, type Investment } from "../../api/investments";
import axios from "../../api/axios";

const AdminInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const data = await getInvestments();
      setInvestments(data);
    } catch (error) {
      console.error("Error fetching investments:", error);
      alert("Failed to fetch investments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: "pending" | "reviewed" | "approved" | "rejected") => {
    if (!confirm(`Are you sure you want to mark this as ${newStatus}?`)) {
      return;
    }

    try {
      setUpdating(true);
      await updateInvestmentStatus(id, newStatus, notes || undefined);
      await fetchInvestments();
      setShowModal(false);
      setNotes("");
      alert(`Status updated to ${newStatus} successfully!`);
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this investment application? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/investments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchInvestments();
      alert("Investment application deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting investment:", error);
      alert(error.response?.data?.message || "Failed to delete. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "reviewed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "investor":
        return <DollarSign className="w-5 h-5" />;
      case "strategic-partner":
        return <Handshake className="w-5 h-5" />;
      case "sponsorship":
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Briefcase className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "investor":
        return "Investor";
      case "strategic-partner":
        return "Strategic Partner";
      case "sponsorship":
        return "Sponsorship";
      default:
        return type;
    }
  };

  const filteredInvestments = investments.filter((inv) => {
    const matchesSearch = 
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.companyName && inv.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesType = typeFilter === "all" || inv.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Type", "Status", "Company", "Sector", "Created At"];
    const rows = filteredInvestments.map(inv => [
      inv.name,
      inv.email,
      inv.phone,
      getTypeLabel(inv.type),
      inv.status,
      inv.companyName || "N/A",
      inv.sector || "N/A",
      new Date(inv.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `investments-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${axios.defaults.baseURL?.replace("/api", "")}${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Handshake className="w-8 h-8 text-orange-600" />
                Investments & Partnerships
              </h1>
              <p className="text-gray-600 mt-2">Manage investment and partnership applications</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={fetchInvestments}
                className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="investor">Investor</option>
                <option value="strategic-partner">Strategic Partner</option>
                <option value="sponsorship">Sponsorship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Investments List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-600">Loading investments...</p>
            </div>
          ) : filteredInvestments.length === 0 ? (
            <div className="p-12 text-center">
              <Handshake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No investments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Created</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvestments.map((investment) => (
                    <tr key={investment._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {investment.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{investment.name}</p>
                            {investment.companyName && (
                              <p className="text-sm text-gray-500">{investment.companyName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="text-orange-600">
                            {getTypeIcon(investment.type)}
                          </div>
                          <span className="text-gray-700">{getTypeLabel(investment.type)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {investment.email}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {investment.phone}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(investment.status)}`}>
                          {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(investment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvestment(investment);
                              setShowModal(true);
                              setNotes(investment.notes || "");
                            }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(investment._id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <XCircle className="w-4 h-4" />
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

      {/* Detail Modal */}
      {showModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Investment Details</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedInvestment(null);
                    setNotes("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900 font-semibold">{selectedInvestment.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedInvestment.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selectedInvestment.phone}</p>
                </div>
                {selectedInvestment.whatsapp && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                    <p className="text-gray-900">{selectedInvestment.whatsapp}</p>
                  </div>
                )}
                {selectedInvestment.companyName && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <p className="text-gray-900">{selectedInvestment.companyName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900">{getTypeLabel(selectedInvestment.type)}</p>
                </div>
              </div>

              {/* Type-specific fields */}
              {selectedInvestment.type === "investor" && (
                <>
                  {selectedInvestment.sector && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sector</label>
                      <p className="text-gray-900">{selectedInvestment.sector}</p>
                    </div>
                  )}
                  {selectedInvestment.investmentType && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Investment Type</label>
                      <p className="text-gray-900">{selectedInvestment.investmentType}</p>
                    </div>
                  )}
                </>
              )}

              {selectedInvestment.type === "strategic-partner" && selectedInvestment.sector && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Sector</label>
                  <p className="text-gray-900">{selectedInvestment.sector}</p>
                </div>
              )}

              {selectedInvestment.type === "sponsorship" && (
                <>
                  {selectedInvestment.officePhone && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Office Phone</label>
                      <p className="text-gray-900">{selectedInvestment.officePhone}</p>
                    </div>
                  )}
                  {selectedInvestment.motto && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Motto</label>
                      <p className="text-gray-900">{selectedInvestment.motto}</p>
                    </div>
                  )}
                  {selectedInvestment.specialPackages && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Special Packages</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedInvestment.specialPackages}</p>
                    </div>
                  )}
                  {selectedInvestment.messages && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Messages</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedInvestment.messages}</p>
                    </div>
                  )}
                  {selectedInvestment.effectiveDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Effective Date</label>
                      <p className="text-gray-900">{new Date(selectedInvestment.effectiveDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedInvestment.expiryDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                      <p className="text-gray-900">{new Date(selectedInvestment.expiryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </>
              )}

              {/* Attachments */}
              {selectedInvestment.attachments && Object.keys(selectedInvestment.attachments).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Attachments</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedInvestment.attachments).map(([key, value]) => {
                      if (!value) return null;
                      const url = getFileUrl(value);
                      return (
                        <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            {url && (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enquiries */}
              {selectedInvestment.enquiries && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Enquiries / Message</label>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedInvestment.enquiries}
                  </p>
                </div>
              )}

              {/* Status Update */}
              <div className="border-t border-gray-200 pt-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Admin Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Add notes about this application..."
                />

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedInvestment._id, "pending")}
                    disabled={updating || selectedInvestment.status === "pending"}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4" />
                    Mark Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedInvestment._id, "reviewed")}
                    disabled={updating || selectedInvestment.status === "reviewed"}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-4 h-4" />
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedInvestment._id, "approved")}
                    disabled={updating || selectedInvestment.status === "approved"}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedInvestment._id, "rejected")}
                    disabled={updating || selectedInvestment.status === "rejected"}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvestments;
