import React, { useState, useEffect } from 'react';
import { Plus, Settings, BarChart3, Star, DollarSign, Edit, Trash2, Calendar, X, Tag } from 'lucide-react';
import { getMyServices, deleteService, type Service } from '../../api/services';
import { getProviderBookings } from '../../api/bookings';
import AddService from './AddService';
import SpecialOffers from './SpecialOffers';

const ProviderDashboard: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [editServiceOpen, setEditServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookings, setShowBookings] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalBookings: 0
  });

  useEffect(() => {
    let isMounted = true;

    // Get user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // For providers, use company name if available, otherwise use name
        const displayName = user.companyName || user.name || 'Provider';
        setCompanyName(displayName);
        setUserEmail(user.email || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    const fetchData = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        // Fetch services
        const servicesData = await getMyServices();
        
        if (!isMounted) return;
        
        setServices(servicesData);
        
        // Fetch bookings
        let bookingsData: any[] = [];
        try {
          bookingsData = await getProviderBookings();
          console.log('Fetched bookings:', bookingsData);
          if (isMounted) {
            setBookings(bookingsData);
          }
        } catch (bookingError) {
          console.error('Error fetching bookings:', bookingError);
          // Set empty array on error to show "No bookings" instead of loading forever
          if (isMounted) {
            setBookings([]);
          }
        }
        
        // Calculate stats
        const activeServices = servicesData.filter(service => service.isAvailable).length;
        const totalEarnings = servicesData.reduce((sum, service) => sum + service.price, 0);
        
        // Calculate average rating from services that actually have ratings
        const servicesWithRatings = servicesData.filter(service => 
          (service.providerRating && service.providerRating > 0) || 
          (service.serviceRating && service.serviceRating > 0)
        );
        const averageRating = servicesWithRatings.length > 0
          ? servicesWithRatings.reduce((sum, service) => {
              const rating = service.serviceRating || service.providerRating || 0;
              return sum + rating;
            }, 0) / servicesWithRatings.length
          : 0;
        
        if (!isMounted) return;
        
        setStats({
          totalServices: servicesData.length,
          activeServices,
          totalEarnings,
          averageRating,
          totalBookings: bookingsData.length
        });
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching data:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteService(serviceId);
        setServices(prev => prev.filter(service => service.id !== serviceId));
        // Update stats
        setStats(prev => ({
          ...prev,
          totalServices: prev.totalServices - 1,
          activeServices: Math.max(0, prev.activeServices - 1)
        }));
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleServiceAdded = async () => {
    // Refresh services and stats
    try {
      const servicesData = await getMyServices();
      setServices(servicesData);
      
      const activeServices = servicesData.filter(service => service.isAvailable).length;
      const totalEarnings = servicesData.reduce((sum, service) => sum + service.price, 0);
      
      // Calculate average rating from services that actually have ratings
      const servicesWithRatings = servicesData.filter(service => 
        (service.providerRating && service.providerRating > 0) || 
        (service.serviceRating && service.serviceRating > 0)
      );
      const averageRating = servicesWithRatings.length > 0
        ? servicesWithRatings.reduce((sum, service) => {
            const rating = service.serviceRating || service.providerRating || 0;
            return sum + rating;
          }, 0) / servicesWithRatings.length
        : 0;
      
      setStats(prev => ({
        ...prev,
        totalServices: servicesData.length,
        activeServices,
        totalEarnings,
        averageRating
      }));
      
      setAddServiceOpen(false);
    } catch (error) {
      console.error('Error refreshing services:', error);
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setEditServiceOpen(true);
  };

  const handleBookingAction = async (bookingId: string, action: 'confirmed' | 'cancelled') => {
    try {
      const token = localStorage.getItem('token');
      const booking = bookings.find(b => b._id === bookingId);
      
      if (!booking || !booking.service?._id) {
        alert('Booking or service info missing.');
        return;
      }

      await import('../../api/axios').then(module => 
        module.default.put(
          `/bookings/${bookingId}`,
          { status: action, service: booking.service._id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      // Refresh bookings
      const updatedBookings = await getProviderBookings();
      setBookings(updatedBookings);
      setStats(prev => ({ ...prev, totalBookings: updatedBookings.length }));
      
      alert(`Booking ${action === 'confirmed' ? 'confirmed' : 'cancelled'} successfully!`);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar - Using first word of company name */}
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {companyName.split(' ')[0].substring(0, 2).toUpperCase() || 'CO'}
              </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{companyName}</h1>
                <p className="text-gray-600 mt-1">{userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowBookings(false); setShowOffers(false); }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${!showBookings && !showOffers ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                My Services
              </button>
              <button
                onClick={() => { setShowBookings(true); setShowOffers(false); }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${showBookings ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Bookings ({stats.totalBookings})
              </button>
              <button
                onClick={() => { setShowBookings(false); setShowOffers(true); }}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${showOffers ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                <Tag className="w-4 h-4" />
                Special Offers
              </button>
            <button
              onClick={() => setAddServiceOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-lg"
            >
              <Plus size={20} />
                <span>Add Service</span>
            </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Services</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeServices}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-orange-600">
                  ${stats.totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Services, Bookings, or Special Offers Section */}
        {showOffers ? (
          /* Special Offers Section */
          <SpecialOffers />
        ) : !showBookings ? (
          /* Services Section */
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Services</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{stats.activeServices} Active</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>{stats.totalServices - stats.activeServices} Inactive</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length > 0 ? (
                <div className="space-y-4">
                {services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex gap-4">
                        {/* Service Image */}
                        <div className="w-32 h-32 flex-shrink-0">
                          {service.photos && service.photos.length > 0 ? (
                            <img
                              src={service.photos[0]}
                              alt={service.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                              <Settings className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Service Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{service.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{service.category} • {service.subcategory}</p>
                              <p className="text-gray-700 line-clamp-2">{service.description}</p>
                            </div>
                            <div className="flex gap-2">
                      <button
                                onClick={() => handleEditService(service)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit Service"
                      >
                                <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete Service"
                      >
                                <Trash2 size={18} />
                      </button>
                            </div>
                          </div>
                          
                          {/* Price and Status */}
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xl font-bold text-orange-600">
                              {service.price} ETB
                              {service.priceType && service.priceType !== 'fixed' && (
                                <span className="text-sm font-normal text-gray-500">
                                  {service.priceType === 'hourly' ? '/hour' : 
                                   service.priceType === 'per_sqft' ? '/sq ft' : 
                                   service.priceType === 'custom' ? ' (starting)' : 
                                   `/${service.priceType}`}
                                </span>
                              )}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              service.isAvailable 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {service.isAvailable ? 'Active' : 'Inactive'}
                            </span>
                            {service.location && (
                              <span className="text-sm text-gray-500">📍 {service.location}</span>
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
                  <Settings className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start by adding your first service to begin attracting customers
                </p>
                <button
                  onClick={() => setAddServiceOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold"
                >
                  Add Your First Service
                </button>
              </div>
            )}
          </div>
          </div>
        ) : (
          /* Bookings Management Section */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Customer Bookings</h2>
              <p className="text-gray-600 mt-1">Manage and respond to customer booking requests</p>
        </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-gray-100 rounded-xl p-4 animate-pulse h-32"></div>
                  ))}
                </div>
              ) : bookings.length > 0 ? (
          <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="grid md:grid-cols-4 gap-4">
                        {/* Customer Info */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Customer</p>
                          <p className="font-semibold text-gray-900">{booking.fullName || booking.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{booking.email || booking.user?.email}</p>
                          {booking.phone && <p className="text-sm text-gray-600">📞 {booking.phone}</p>}
                        </div>
                        
                        {/* Service & Date */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Service</p>
                          <p className="font-medium text-gray-900">{booking.service?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          {booking.time && <p className="text-sm text-gray-600">🕐 {booking.time}</p>}
                        </div>
                        
                        {/* Note & Price */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Details</p>
                          {booking.note && <p className="text-sm text-gray-700 italic line-clamp-2">"{booking.note}"</p>}
                          {booking.service?.price && (
                            <p className="text-lg font-bold text-orange-600 mt-1">{booking.service.price} ETB</p>
                          )}
                        </div>
                        
                        {/* Status & Actions */}
                        <div className="flex flex-col gap-2">
                          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold text-center ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          
                          {booking.status === 'pending' && (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleBookingAction(booking._id, 'confirmed')}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                ✓ Confirm
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking._id, 'cancelled')}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              >
                                ✗ Cancel
                              </button>
                            </div>
                          )}
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                  <p className="text-gray-600">
                    When customers book your services, they'll appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats Summary */}
        <div className="mt-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg border border-orange-200 p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Your Performance Summary</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-orange-100 text-sm">Services Published</p>
                  <p className="text-3xl font-bold">{stats.totalServices}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-orange-100 text-sm">Total Bookings</p>
                  <p className="text-3xl font-bold">{stats.totalBookings}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-orange-100 text-sm">Average Rating</p>
                  <p className="text-3xl font-bold">{stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'} ⭐</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {addServiceOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add New Service</h2>
                <button
                  onClick={() => setAddServiceOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <AddService onServiceAdded={handleServiceAdded} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editServiceOpen && selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit Service</h2>
                <button
                  onClick={() => {
                    setEditServiceOpen(false);
                    setSelectedService(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Editing:</strong> {selectedService.title}
                </p>
            </div>
              <AddService 
                onServiceAdded={async () => {
                  await handleServiceAdded();
                  setEditServiceOpen(false);
                  setSelectedService(null);
                }}
                editMode={true}
                existingService={selectedService}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDashboard;
