import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, User, MessageSquare, CreditCard, CheckCircle, Tag } from 'lucide-react';
import { type Service } from '../api/services';
import axios from '../api/axios';
import { normalizeImageUrl, handleImageError } from '../utils/imageHelper';

interface SpecialOffer {
  _id: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface BookingModalProps {
  service: Service;
  specialOffer?: SpecialOffer | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (booking: any) => void;
}

interface BookingFormData {
  date: string;
  time: string;
  note: string;
  paymentMethod: 'cash' | 'online';
  referralCode: string; // Optional referral code
  // Guest information
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  service,
  specialOffer,
  isOpen,
  onClose,
  onBookingSuccess
}) => {
  // Use discounted price if special offer is available, otherwise use service price
  const finalPrice = specialOffer ? specialOffer.discountedPrice : service.price;
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BookingFormData>({
    date: '',
    time: '',
    note: '',
    paymentMethod: 'cash',
    referralCode: '',
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
        // Try to get user info from localStorage first
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
          } else {
            // Fetch user info from API if not in localStorage
            // Try /user/me first, fallback to /auth/me
            axios.get('/user/me', {
              headers: { Authorization: `Bearer ${token}` }
            }).then(response => {
              const user = response.data;
              setUserInfo(user);
              localStorage.setItem('user', JSON.stringify(user));
              setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
              }));
            }).catch(async (error) => {
              // If /user/me fails, try /auth/me
              console.warn('Error fetching from /user/me, trying /auth/me:', error);
              try {
                const response = await axios.get('/auth/me', {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (response && response.data) {
                  const user = response.data;
                  setUserInfo(user);
                  localStorage.setItem('user', JSON.stringify(user));
                  setFormData(prev => ({
                    ...prev,
                    fullName: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.address || ''
                  }));
                }
              } catch (authError) {
                console.error('Error fetching user info from both endpoints:', authError);
                // If token is invalid, treat as guest
                setIsLoggedIn(false);
                localStorage.removeItem('token');
              }
            });
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsLoggedIn(false);
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

      // Validate date and time
      if (!formData.date || !formData.time) {
        setError('Please select both date and time');
        setLoading(false);
        return;
      }

      // Combine date and time
      const bookingDateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Validate the date is valid
      if (isNaN(bookingDateTime.getTime())) {
        setError('Invalid date or time selected. Please try again.');
        setLoading(false);
        return;
      }
      
      // Get service ID - handle both id and _id properties
      const serviceId = (service as any).id || (service as any)._id || service.id;
      
      if (!serviceId) {
        console.error('Service object:', service);
        setError('Service ID is missing. Please refresh and try again.');
        setLoading(false);
        return;
      }
      
      const bookingData = {
        service: serviceId,
        date: bookingDateTime.toISOString(),
        note: formData.note || '',
        paymentMethod: formData.paymentMethod,
        // Referral code (if provided)
        ...(formData.referralCode ? { referralCode: formData.referralCode.trim().toUpperCase() } : {}),
        // Guest information (only if not logged in)
        ...(isLoggedIn ? {} : {
          guestInfo: {
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim()
          }
        })
      };

      console.log('Submitting booking with data:', {
        serviceId: bookingData.service,
        date: bookingData.date,
        hasGuestInfo: !!bookingData.guestInfo,
        isLoggedIn
      });

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Use longer timeout for booking requests in production
      const response = await axios.post('/bookings', bookingData, { 
        headers,
        timeout: 60000, // 60 seconds for production environments
      });
      
      console.log('Booking response:', response.data);

      // Prepare booking data with user/guest information
      const bookingWithUserInfo = {
        ...response.data,
        // Ensure guestInfo is included if it's a guest booking
        guestInfo: response.data.guestInfo || (!isLoggedIn ? {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        } : undefined),
        // Include user info if logged in (in case server didn't populate it)
        user: response.data.user || (isLoggedIn && userInfo ? {
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          address: userInfo.address
        } : response.data.user)
      };
      
      // Close modal first
      onClose();
      
      // Small delay to ensure modal closes before navigation
      setTimeout(() => {
        // If online payment is selected, navigate to payment page
        if (formData.paymentMethod === 'online') {
          console.log('Navigating to payment page with booking:', bookingWithUserInfo);
          console.log('Service data:', service);
          console.log('Service price:', service.price);
          
          // Navigate to payment page with booking details
          navigate('/payment', { 
            state: { 
              booking: bookingWithUserInfo,
              service: service,
              amount: finalPrice || 0,
              type: 'booking', // Add type to identify booking payment
              specialOffer: specialOffer || null
            } 
          });
        } else {
          // For cash payment, navigate directly to invoice/success page
          console.log('Navigating to invoice page for cash payment:', bookingWithUserInfo);
          
          // Navigate to payment success page with invoice (for cash payment)
          navigate('/payment-success', {
            state: {
              booking: bookingWithUserInfo,
              service: service,
              amount: finalPrice || 0,
              type: 'booking', // This will show the invoice
              specialOffer: specialOffer || null
            }
          });
        }
        
        // Call success callback if provided
        if (onBookingSuccess) {
          onBookingSuccess(response.data);
        }
      }, 100);

    } catch (err: any) {
      console.error('Booking error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        code: err.code,
      });
      
      let errorMessage = 'Booking failed. Please try again.';
      
      // Handle timeout errors specifically
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'The booking request timed out. The server may be slow. Please try again in a moment.';
      } else if (err.response?.status === 401) {
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
                src={normalizeImageUrl(service.photos[0], {
                  width: 128,
                  height: 128,
                  crop: 'fill',
                  quality: 'auto',
                  format: 'auto'
                }) || service.photos[0]}
                alt={service.title}
                className="w-16 h-16 rounded-lg object-cover"
                loading="lazy"
                onError={(e) => handleImageError(e)}
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
                {specialOffer ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-orange-600" />
                      <span className="text-xs text-orange-600 font-semibold">
                        {specialOffer.discountType === 'percentage'
                          ? `${specialOffer.discountValue}% OFF`
                          : `${specialOffer.discountValue} ETB OFF`}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-orange-600">
                        {formatPrice(specialOffer.discountedPrice, service.priceType)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(service.price, service.priceType)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-orange-600">
                    {formatPrice(service.price, service.priceType)}
                  </span>
                )}
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

            {/* Referral Code (Optional) */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-purple-600">🎁</span> Referral Code <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleInputChange}
                placeholder="Enter referral code if you have one"
                className="w-full px-3 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 uppercase"
                style={{ textTransform: 'uppercase' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Have a referral code? Enter it here to support the person who referred you!
              </p>
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
