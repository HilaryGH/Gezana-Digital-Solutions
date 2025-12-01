import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Eye, CheckCircle, XCircle, Clock, FileText, Mail, Phone, Building, X } from 'lucide-react';
import { getInvestments, updateInvestmentStatus, type Investment } from '../../api/investments';

const AdminInvestments = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'investor' | 'strategic-partner' | 'sponsorship'>('all');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const data = await getInvestments();
      setInvestments(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching investments:', err);
      setError(err.response?.data?.message || 'Failed to fetch investments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'pending' | 'reviewed' | 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      await updateInvestmentStatus(id, status, statusNotes || undefined);
      await fetchInvestments();
      setStatusNotes('');
      setError(null);
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'investor':
        return 'Investor';
      case 'strategic-partner':
        return 'Strategic Partner';
      case 'sponsorship':
        return 'Sponsorship';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredInvestments = investments.filter((investment) => {
    const matchesSearch =
      investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.phone.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || investment.status === statusFilter;
    const matchesType = typeFilter === 'all' || investment.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Investment & Partnership Applications</h2>
        <p className="text-gray-600 mt-1">Manage investment, partnership, and sponsorship applications</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Types</option>
            <option value="investor">Investor</option>
            <option value="strategic-partner">Strategic Partner</option>
            <option value="sponsorship">Sponsorship</option>
          </select>
        </div>
      </div>

      {/* Investments List */}
      {filteredInvestments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No applications found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInvestments.map((investment) => (
            <div
              key={investment._id}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{investment.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(investment.status)}`}
                        >
                          {investment.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {getTypeLabel(investment.type)}
                        </span>
                      </div>
                      {investment.companyName && (
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <Building className="w-4 h-4" />
                          <span>{investment.companyName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-orange-600" />
                      <span>{investment.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-orange-600" />
                      <span>{investment.phone}</span>
                    </div>
                    {investment.whatsapp && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span>WhatsApp: {investment.whatsapp}</span>
                      </div>
                    )}
                    {investment.sector && (
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-600 font-semibold">Sector:</span>
                        <span>{investment.sector}</span>
                      </div>
                    )}
                    {investment.investmentType && (
                      <div className="flex items-center space-x-2">
                        <span className="text-orange-600 font-semibold">Investment Type:</span>
                        <span>{investment.investmentType}</span>
                      </div>
                    )}
                  </div>

                  {investment.enquiries && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{investment.enquiries}</p>
                  )}

                  <div className="text-xs text-gray-500">
                    Submitted: {formatDate(investment.createdAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedInvestment(investment);
                      setShowDetailsModal(true);
                      setStatusNotes(investment.notes || '');
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-orange-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">Application Details</h3>
                  <p className="text-orange-100 text-sm mt-1">
                    {getTypeLabel(selectedInvestment.type)} - {selectedInvestment.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedInvestment(null);
                    setStatusNotes('');
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedInvestment.status)}`}>
                      {selectedInvestment.status}
                    </span>
                    <span className="ml-3 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {getTypeLabel(selectedInvestment.type)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(selectedInvestment.createdAt)}
                  </div>
                </div>

                {/* Status Update */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Update Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['pending', 'reviewed', 'approved', 'rejected'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedInvestment._id, status)}
                        disabled={actionLoading === selectedInvestment._id || selectedInvestment.status === status}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                          selectedInvestment.status === status
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Add notes (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-gray-900">{selectedInvestment.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedInvestment.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedInvestment.phone}</p>
                  </div>
                  {selectedInvestment.whatsapp && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">WhatsApp</label>
                      <p className="text-gray-900">{selectedInvestment.whatsapp}</p>
                    </div>
                  )}
                  {selectedInvestment.companyName && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Company Name</label>
                      <p className="text-gray-900">{selectedInvestment.companyName}</p>
                    </div>
                  )}
                  {selectedInvestment.officePhone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Office Phone</label>
                      <p className="text-gray-900">{selectedInvestment.officePhone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Type-Specific Fields */}
              {(selectedInvestment.sector || selectedInvestment.investmentType) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Investment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedInvestment.sector && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Sector</label>
                        <p className="text-gray-900">{selectedInvestment.sector}</p>
                      </div>
                    )}
                    {selectedInvestment.investmentType && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Investment Type</label>
                        <p className="text-gray-900">{selectedInvestment.investmentType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sponsorship Specific Fields */}
              {(selectedInvestment.motto || selectedInvestment.specialPackages || selectedInvestment.messages) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Sponsorship Details</h4>
                  <div className="space-y-4">
                    {selectedInvestment.motto && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Motto</label>
                        <p className="text-gray-900">{selectedInvestment.motto}</p>
                      </div>
                    )}
                    {selectedInvestment.specialPackages && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Special Packages</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedInvestment.specialPackages}</p>
                      </div>
                    )}
                    {selectedInvestment.messages && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Messages</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedInvestment.messages}</p>
                      </div>
                    )}
                    {(selectedInvestment.effectiveDate || selectedInvestment.expiryDate) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedInvestment.effectiveDate && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Effective Date</label>
                            <p className="text-gray-900">
                              {new Date(selectedInvestment.effectiveDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {selectedInvestment.expiryDate && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Expiry Date</label>
                            <p className="text-gray-900">
                              {new Date(selectedInvestment.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedInvestment.attachments && Object.keys(selectedInvestment.attachments).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedInvestment.attachments.idPassport && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">ID / Passport / Driving Licence</label>
                        <a
                          href={selectedInvestment.attachments.idPassport}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline block mt-1"
                        >
                          View File
                        </a>
                      </div>
                    )}
                    {selectedInvestment.attachments.license && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">License</label>
                        <a
                          href={selectedInvestment.attachments.license}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline block mt-1"
                        >
                          View File
                        </a>
                      </div>
                    )}
                    {selectedInvestment.attachments.tradeRegistration && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Trade Registration</label>
                        <a
                          href={selectedInvestment.attachments.tradeRegistration}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline block mt-1"
                        >
                          View File
                        </a>
                      </div>
                    )}
                    {selectedInvestment.attachments.businessProposal && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Business Proposal</label>
                        <a
                          href={selectedInvestment.attachments.businessProposal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline block mt-1"
                        >
                          View File
                        </a>
                      </div>
                    )}
                    {selectedInvestment.attachments.businessPlan && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Business Plan</label>
                        <a
                          href={selectedInvestment.attachments.businessPlan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline block mt-1"
                        >
                          View File
                        </a>
                      </div>
                    )}
                    {selectedInvestment.attachments.logo && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Logo</label>
                        <a
                          href={selectedInvestment.attachments.logo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline block mt-1"
                        >
                          View File
                        </a>
                      </div>
                    )}
                    {selectedInvestment.attachments.mouSigned && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">MOU Signed</label>
                        <a
                          href={selectedInvestment.attachments.mouSigned}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline block mt-1"
                        >
                          View File
                        </a>
                      </div>
                    )}
                    {selectedInvestment.attachments.contractSigned && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Contract Signed</label>
                        <a
                          href={selectedInvestment.attachments.contractSigned}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:underline block mt-1"
                        >
                          View File
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Enquiries */}
              {selectedInvestment.enquiries && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Enquiries</h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedInvestment.enquiries}</p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedInvestment.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedInvestment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvestments;

