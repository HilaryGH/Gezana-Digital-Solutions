import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, User, MessageSquare, CreditCard, CheckCircle } from 'lucide-react';
import { type Service } from '../api/services';
import axios from '../api/axios';

interface BookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (booking: any) => void;
}

interface BookingFormData {
  date: string;
  time: string;
  note: string;
  paymentMethod: 'cash' | 'online';
  // Guest information
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  service,
  isOpen,
  onClose,
  onBookingSuccess
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BookingFormData>({
    date: '',
    time: '',
    note: '',
    paymentMethod: 'cash',
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Check if user is logged in and populate their information
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Try to get user info from token or make an API call
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserInfo(user);
          setFormData(prev => ({
            ...prev,
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
          }));
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Available time slots
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields for guests
      if (!isLoggedIn) {
        if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
      }

      // Combine date and time
      const bookingDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const bookingData = {
        service: service.id,
        date: bookingDateTime.toISOString(),
        note: formData.note,
        paymentMethod: formData.paymentMethod,
        // Guest information (only if not logged in)
        ...(isLoggedIn ? {} : {
          guestInfo: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
          }
        })
      };

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post('/bookings', bookingData, { headers });

      // If online payment is selected, navigate to payment page
      if (formData.paymentMethod === 'online') {
        onClose();
        // Navigate to payment page with booking details
        navigate('/payment', { 
          state: { 
            booking: response.data,
            service: service,
            amount: service.price
          } 
        });
      } else {
        // For cash payment, show success message
        setSuccess(true);
        if (onBookingSuccess) {
          onBookingSuccess(response.data);
        }

        // Reset form
        setFormData({
          date: '',
          time: '',
          note: '',
          paymentMethod: 'cash',
          fullName: isLoggedIn ? (userInfo?.name || '') : '',
          email: isLoggedIn ? (userInfo?.email || '') : '',
          phone: isLoggedIn ? (userInfo?.phone || '') : '',
          address: isLoggedIn ? (userInfo?.address || '') : ''
        });

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      }

    } catch (err: any) {
      console.error('Booking error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      let errorMessage = 'Booking failed. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Please log in to book a service';
      } else if (err.response?.status === 404) {
        errorMessage = 'Service not found. Please refresh and try again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

    switch (priceType) {
      case 'hourly': return `${formattedPrice}/hour`;
      case 'per_sqft': return `${formattedPrice}/sq ft`;
      case 'custom': return `From ${formattedPrice}`;
      default: return formattedPrice;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Book Service</h2>
              <p className="text-sm text-gray-500">Schedule your appointment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Service Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            {service.photos && service.photos.length > 0 ? (
              <img
                src={service.photos[0]}
                alt={service.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{service.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{service.providerName}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{service.category}</span>
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-orange-600">
                  {formatPrice(service.price, service.priceType)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Booking Successful!</h3>
                <p className="text-green-600">Your service has been booked. You'll receive a confirmation soon.</p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Select Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={minDate}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Select Time
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Choose a time slot</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Guest Information (only show if not logged in) */}
            {!isLoggedIn && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Your Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Logged in user info display */}
            {isLoggedIn && userInfo && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                  <User className="w-5 h-5 mr-2" />
                  Booking as: {userInfo.name}
                </h3>
                <p className="text-sm text-gray-600">Email: {userInfo.email}</p>
                {userInfo.phone && <p className="text-sm text-gray-600">Phone: {userInfo.phone}</p>}
                {userInfo.address && <p className="text-sm text-gray-600">Address: {userInfo.address}</p>}
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium">Pay in Cash</div>
                    <div className="text-sm text-gray-500">Pay when service is completed</div>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={handleInputChange}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <div className="font-medium">Pay Online</div>
                    <div className="text-sm text-gray-500">Secure online payment</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Additional Notes (Optional)
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any special requirements or details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.date || !formData.time}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Book Service</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
