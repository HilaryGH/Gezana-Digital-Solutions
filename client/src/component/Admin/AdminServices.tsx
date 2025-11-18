import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trash2, Eye, Search, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import axios from '../../api/axios';

interface Provider {
  _id: string;
  name: string;
  email: string;
}

interface AdminService {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type: string;
  priceType: string;
  location: string;
  photos: string[];
  provider: Provider;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminServices = () => {
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get<AdminService[]>("/services/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching admin services:", err);
      setError(err.response?.data?.message || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveService = async (serviceId: string) => {
    setActionLoading(serviceId);
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/services/admin/services/${serviceId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(services.map(service => 
        service._id === serviceId ? { ...service, isActive: true } : service
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve service");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectService = async (serviceId: string) => {
    setActionLoading(serviceId);
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/services/admin/services/${serviceId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(services.map(service => 
        service._id === serviceId ? { ...service, isActive: false } : service
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject service");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(serviceId);
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/services/admin/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(services.filter(service => service._id !== serviceId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete service");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && service.isActive) ||
                         (statusFilter === 'inactive' && !service.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

    switch (priceType) {
      case 'hourly': return `${formattedPrice} ETB/hour`;
      case 'per_sqft': return `${formattedPrice} ETB/sq ft`;
      case 'custom': return `From ${formattedPrice} ETB`;
      default: return `${formattedPrice} ETB`;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600">Loading services...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
          <p className="text-gray-600">Manage and approve service listings</p>
        </div>
        <button
          onClick={fetchServices}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services, providers, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Services</option>
              <option value="active">Approved</option>
              <option value="inactive">Pending/Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{services.filter(s => s.isActive).length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{services.filter(s => !s.isActive).length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No services have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {service.photos && service.photos.length > 0 ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={service.photos[0]}
                              alt={service.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                              <span className="text-orange-600 font-bold text-lg">
                                {service.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.provider.name}</div>
                      <div className="text-sm text-gray-500">{service.provider.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.category}</div>
                      <div className="text-sm text-gray-500">{service.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(service.price, service.priceType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {service.isActive ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!service.isActive && (
                          <button
                            onClick={() => handleApproveService(service._id)}
                            disabled={actionLoading === service._id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Approve Service"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {service.isActive && (
                          <button
                            onClick={() => handleRejectService(service._id)}
                            disabled={actionLoading === service._id}
                            className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                            title="Reject Service"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          disabled={actionLoading === service._id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete Service"
                        >
                          <Trash2 className="w-5 h-5" />
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
  );
};

export default AdminServices;