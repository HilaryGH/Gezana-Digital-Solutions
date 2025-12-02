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
  MapPin,
  User,
  Calendar,
  Heart
} from "lucide-react";
import { getWomenInitiatives, updateWomenInitiativeStatus, type WomenInitiative } from "../../api/womenInitiatives";
import axios from "../../api/axios";

const AdminWomenInitiatives = () => {
  const [initiatives, setInitiatives] = useState<WomenInitiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInitiative, setSelectedInitiative] = useState<WomenInitiative | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const data = await getWomenInitiatives();
      setInitiatives(data);
    } catch (error) {
      console.error("Error fetching women initiatives:", error);
      alert("Failed to fetch women initiatives. Please try again.");
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
      await updateWomenInitiativeStatus(id, newStatus, notes || undefined);
      await fetchInitiatives();
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
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/women-initiatives/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchInitiatives();
      alert("Application deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting application:", error);
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

  const filteredInitiatives = initiatives.filter((init) => {
    const matchesSearch = 
      init.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      init.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (init.city && init.city.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || init.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["Full Name", "Age", "Email", "Phone", "Status", "City", "Location", "Created At"];
    const rows = filteredInitiatives.map(init => [
      init.fullName,
      init.age.toString(),
      init.email,
      init.phone || "N/A",
      init.status,
      init.city || "N/A",
      init.location || "N/A",
      new Date(init.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `women-initiatives-${new Date().toISOString().split('T')[0]}.csv`);
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
                <Heart className="w-8 h-8 text-pink-600" />
                Women Initiatives
              </h1>
              <p className="text-gray-600 mt-2">Manage women initiative applications</p>
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
                onClick={fetchInitiatives}
                className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Initiatives List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
              <p className="mt-4 text-gray-600">Loading applications...</p>
            </div>
          ) : filteredInitiatives.length === 0 ? (
            <div className="p-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Age</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Location</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Created</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInitiatives.map((initiative) => (
                    <tr key={initiative._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {initiative.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{initiative.fullName}</p>
                            <p className="text-sm text-gray-500">{initiative.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{initiative.age}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {initiative.phone && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {initiative.phone}
                            </p>
                          )}
                          {initiative.whatsapp && (
                            <p className="text-sm text-gray-600">WhatsApp: {initiative.whatsapp}</p>
                          )}
                          {initiative.telegram && (
                            <p className="text-sm text-gray-600">Telegram: {initiative.telegram}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {initiative.city && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {initiative.city}
                            </p>
                          )}
                          {initiative.location && (
                            <p className="text-sm text-gray-500">{initiative.location}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(initiative.status)}`}>
                          {initiative.status.charAt(0).toUpperCase() + initiative.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(initiative.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedInitiative(initiative);
                              setShowModal(true);
                              setNotes(initiative.notes || "");
                            }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(initiative._id)}
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
      {showModal && selectedInitiative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedInitiative(null);
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
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 font-semibold">{selectedInitiative.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Age</label>
                  <p className="text-gray-900">{selectedInitiative.age}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedInitiative.email}</p>
                </div>
                {selectedInitiative.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedInitiative.phone}</p>
                  </div>
                )}
                {selectedInitiative.whatsapp && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                    <p className="text-gray-900">{selectedInitiative.whatsapp}</p>
                  </div>
                )}
                {selectedInitiative.telegram && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Telegram</label>
                    <p className="text-gray-900">{selectedInitiative.telegram}</p>
                  </div>
                )}
                {selectedInitiative.city && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <p className="text-gray-900">{selectedInitiative.city}</p>
                  </div>
                )}
                {selectedInitiative.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900">{selectedInitiative.location}</p>
                  </div>
                )}
              </div>

              {/* Attachments */}
              {selectedInitiative.attachments && Object.keys(selectedInitiative.attachments).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Attachments</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedInitiative.attachments.idPassport && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">ID / Passport</p>
                          <a
                            href={getFileUrl(selectedInitiative.attachments.idPassport) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View File
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedInitiative.attachments.profilePhoto && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                          <a
                            href={getFileUrl(selectedInitiative.attachments.profilePhoto) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View File
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedInitiative.attachments.certificates && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">Certificates</p>
                          <a
                            href={getFileUrl(selectedInitiative.attachments.certificates) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View File
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="border-t border-gray-200 pt-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Admin Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Add notes about this application..."
                />

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => handleStatusUpdate(selectedInitiative._id, "pending")}
                    disabled={updating || selectedInitiative.status === "pending"}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4" />
                    Mark Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedInitiative._id, "reviewed")}
                    disabled={updating || selectedInitiative.status === "reviewed"}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-4 h-4" />
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedInitiative._id, "approved")}
                    disabled={updating || selectedInitiative.status === "approved"}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedInitiative._id, "rejected")}
                    disabled={updating || selectedInitiative.status === "rejected"}
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

export default AdminWomenInitiatives;

