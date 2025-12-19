import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { getThumbnailUrl, handleImageError } from '../utils/imageHelper';
import axios from '../api/axios';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cash'>('online');

  const { booking, service, amount, type, membership, subscription, planName } = location.state || {};
  const isPremiumMembership = type === 'premium-membership';
  const isBooking = type === 'booking' || (!type && booking && service);

  useEffect(() => {
    // Check if we have valid data for either booking or premium membership
    if (isPremiumMembership) {
      if (!membership || !amount) {
        console.warn('PaymentPage: Missing membership or amount data, redirecting to home');
        navigate('/');
      } else {
        console.log('PaymentPage: Received premium membership data:', { membership, amount, planName, subscription });
      }
    } else if (isBooking) {
      if (!booking || !service) {
        console.warn('PaymentPage: Missing booking or service data, redirecting to home');
        navigate('/');
      } else {
        console.log('PaymentPage: Received booking data:', { booking, service, amount, type });
      }
    } else {
      console.warn('PaymentPage: Invalid payment type, redirecting to home');
      navigate('/');
    }
  }, [booking, service, membership, amount, type, isPremiumMembership, isBooking, navigate, planName, subscription]);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to complete payment');
        setLoading(false);
        return;
      }

      let transactionId: string;
      
      if (paymentMethod === 'online') {
        // Here you would integrate with your payment gateway
        // For now, we'll simulate a successful payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      } else {
        // Cash payment - no simulation needed
        transactionId = `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      if (isPremiumMembership && membership) {
        // Update premium membership payment status
        try {
          const response = await axios.patch(`/premium-memberships/${membership._id}/payment`, {
            paymentStatus: 'paid',
            paymentMethod: paymentMethod,
            transactionId: transactionId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Navigate to success page with updated membership data
          navigate('/payment-success', {
            state: {
              type: 'premium-membership',
              membership: response.data.membership || { ...membership, paymentStatus: 'paid', transactionId, paymentMethod },
              amount,
              planName,
              subscription,
              transactionId,
              paymentMethod
            }
          });
        } catch (err: any) {
          console.error('Error updating premium membership payment status:', err);
          const errorMessage = err.response?.data?.message || err.message || 'Failed to update payment status';
          setError(errorMessage);
          setLoading(false);
          return;
        }
      } else if (isBooking && booking) {
        // Update booking payment status on server
        try {
          if (booking._id || booking.id) {
            await axios.patch(`/bookings/${booking._id || booking.id}/payment`, {
              paymentStatus: 'paid',
              paymentMethod: 'online'
            }, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
          }
        } catch (err) {
          console.error('Error updating booking payment status:', err);
          // Continue to success page even if update fails
        }

        // Navigate to success page
        navigate('/payment-success', {
          state: {
            booking,
            service,
            amount,
            type: type || 'booking'
          }
        });
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (isPremiumMembership && !membership) {
    return null;
  }
  if (isBooking && (!booking || !service)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Secure Payment</h1>
                  <p className="text-sm text-gray-600">
                    {isPremiumMembership ? 'Complete your premium membership payment' : 'Complete your booking payment'}
                  </p>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-6">
                {/* Credit/Debit Card */}
                <div className={`border-2 rounded-xl p-6 transition-all ${
                  paymentMethod === 'online' 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">Pay with Card</h3>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                        className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <img src="/visa.png" alt="Visa" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                      <img src="/mastercard.png" alt="Mastercard" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                    </div>
                  </div>

                  {paymentMethod === 'online' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            maxLength={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter name on card"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cash Payment Option */}
                {isPremiumMembership && (
                  <div className={`border-2 rounded-xl p-6 transition-all ${
                    paymentMethod === 'cash' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Pay with Cash</h3>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Pay in cash when you visit our office or arrange for cash payment. An invoice will be generated immediately.
                    </p>
                    {paymentMethod === 'cash' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Your membership will be activated immediately and an invoice will be generated. Please complete cash payment within 7 days.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Payment Options */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Payment Methods</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-gray-900">Telebirr</span>
                      <span className="text-sm text-gray-500">Coming Soon</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-gray-900">CBE Birr</span>
                      <span className="text-sm text-gray-500">Coming Soon</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-gray-900">M-Pesa</span>
                      <span className="text-sm text-gray-500">Coming Soon</span>
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Pay Button */}
      <button
        onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>
                        {paymentMethod === 'cash' 
                          ? `Confirm Cash Payment - ${amount} ETB` 
                          : `Pay ${amount} ETB Securely`}
                      </span>
                    </>
                  )}
      </button>

                {/* Security Info */}
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              {isPremiumMembership ? (
                /* Premium Membership Details */
                <div className="space-y-4 mb-6">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{planName || subscription?.planName}</h3>
                    <p className="text-sm text-gray-600 mb-3">{subscription?.period === 'month' ? 'Monthly Subscription' : 'Yearly Subscription'}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan Type</span>
                        <span className="font-medium text-gray-900">{subscription?.userType === 'seeker' ? 'Service Seeker' : 'Service Provider'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Billing Period</span>
                        <span className="font-medium text-gray-900 capitalize">{subscription?.period || 'month'}</span>
                      </div>
                      {membership?.organization && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Organization</span>
                          <span className="font-medium text-gray-900">{membership.organization}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Service Details */
                <div className="space-y-4 mb-6">
                  {service.photos && service.photos.length > 0 && (
                    <img
                      src={getThumbnailUrl(service.photos[0]) || service.photos[0]}
                      alt={service.title}
                      className="w-full h-32 object-cover rounded-lg"
                      loading="lazy"
                      onError={handleImageError}
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-600">{service.category}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider</span>
                      <span className="font-medium text-gray-900">{service.providerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium text-gray-900">{service.location}</span>
                    </div>
                    {booking.date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium text-gray-900">
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-gray-900">{amount} ETB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium text-gray-900">0 ETB</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-orange-600">{amount} ETB</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Verified Provider</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Money Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
