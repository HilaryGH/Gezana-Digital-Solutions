import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Download, ArrowLeft, FileText, Calendar, CreditCard, User, Building } from "lucide-react";
import axios from "../api/axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { type, membership, amount, planName, transactionId, booking, service, paymentMethod } = location.state || {};
  const isPremiumMembership = type === 'premium-membership';
  const isBooking = type === 'booking' || (!type && booking && service);

  useEffect(() => {
    if (isPremiumMembership && membership?._id) {
      fetchInvoice();
      // Set flag to refresh premium status in SpecialOffers component
      sessionStorage.setItem('premiumPaymentSuccess', 'true');
    }
    // For bookings, generate invoice data
    if (isBooking && booking && service) {
      generateBookingInvoice();
    }
  }, [isPremiumMembership, membership, isBooking, booking, service]);

  const generateBookingInvoice = () => {
    if (!booking || !service) return;
    
    // Determine payment method and status
    const paymentMethod = booking.paymentMethod || (type === 'booking' ? 'cash' : 'online');
    const paymentStatus = booking.paymentStatus || (paymentMethod === 'online' ? 'pending' : 'pending');
    
    // Get customer information - check multiple sources
    let customerName = 'Guest';
    let customerEmail = 'N/A';
    let customerPhone = 'N/A';
    let customerAddress = 'N/A';
    
    // First, try to get from booking guestInfo (for guest bookings)
    if (booking.guestInfo && booking.guestInfo.fullName) {
      customerName = booking.guestInfo.fullName;
      customerEmail = booking.guestInfo.email || 'N/A';
      customerPhone = booking.guestInfo.phone || 'N/A';
      customerAddress = booking.guestInfo.address || 'N/A';
    }
    // If user is logged in, try to get from booking.user (populated)
    else if (booking.user) {
      // Check if user is populated (object) or just an ID (string)
      if (typeof booking.user === 'object' && booking.user !== null) {
        customerName = booking.user.name || customerName;
        customerEmail = booking.user.email || customerEmail;
        customerPhone = booking.user.phone || customerPhone;
        customerAddress = booking.user.address || customerAddress;
      } else if (typeof booking.user === 'string') {
        // User is just an ID, try to get from localStorage
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            customerName = user.name || customerName;
            customerEmail = user.email || customerEmail;
            customerPhone = user.phone || customerPhone;
            customerAddress = user.address || customerAddress;
          }
        } catch (err) {
          console.error('Error parsing user data from localStorage:', err);
        }
      }
    }
    
    console.log('Invoice customer info:', { customerName, customerEmail, customerPhone, customerAddress });
    console.log('Booking data:', { 
      hasGuestInfo: !!booking.guestInfo, 
      hasUser: !!booking.user,
      userType: typeof booking.user 
    });
    
    // Generate 4-digit invoice number for booking
    // Use booking ID hash or timestamp to generate unique 4-digit number
    const bookingIdStr = String(booking._id || booking.id || Date.now());
    // Convert booking ID string to a number and get last 4 digits
    const hash = bookingIdStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const invoiceNum = String((hash % 10000)).padStart(4, "0");
    const invoiceData = {
      invoiceNumber: `INV-BKG-${invoiceNum}`,
      date: new Date().toISOString(),
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress
      },
      booking: {
        id: booking._id || booking.id,
        date: booking.date,
        status: booking.status || 'pending',
        note: booking.note || ''
      },
      service: {
        name: service.title || service.name,
        category: service.category,
        provider: service.providerName || 'N/A',
        location: service.location || 'N/A'
      },
      amount: {
        subtotal: amount || service.price || 0,
        tax: 0,
        total: amount || service.price || 0,
        currency: 'ETB'
      },
      payment: {
        status: paymentStatus,
        method: paymentMethod,
        transactionId: paymentMethod === 'online' ? `TXN-${Date.now()}` : `CASH-${Date.now()}`,
        paidAt: paymentMethod === 'cash' ? new Date().toISOString() : (booking.paymentStatus === 'paid' ? new Date().toISOString() : null)
      }
    };
    
    setInvoice(invoiceData);
  };

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/premium-memberships/${membership._id}/invoice`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setInvoice(response.data.invoice);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!invoice) return;
    
    let invoiceContent = '';
    
    if (isBooking) {
      // Booking invoice
      invoiceContent = `
═══════════════════════════════════════════════════════
              HOMEHUB DIGITAL SOLUTIONS
═══════════════════════════════════════════════════════

BOOKING INVOICE
Invoice Number: ${invoice.invoiceNumber}
Date: ${new Date(invoice.date).toLocaleDateString()}

CUSTOMER INFORMATION
Name: ${invoice.customer.name}
Email: ${invoice.customer.email}
Phone: ${invoice.customer.phone}
Address: ${invoice.customer.address}

BOOKING DETAILS
Booking ID: ${invoice.booking.id}
Service Date: ${new Date(invoice.booking.date).toLocaleDateString()}
Service Time: ${new Date(invoice.booking.date).toLocaleTimeString()}
Status: ${invoice.booking.status}
${invoice.booking.note ? `Notes: ${invoice.booking.note}` : ''}

SERVICE INFORMATION
Service: ${invoice.service.name}
Category: ${invoice.service.category}
Provider: ${invoice.service.provider}
Location: ${invoice.service.location}

PAYMENT DETAILS
Subtotal: ${invoice.amount.subtotal} ${invoice.amount.currency}
Tax: ${invoice.amount.tax} ${invoice.amount.currency}
Total: ${invoice.amount.total} ${invoice.amount.currency}

Payment Status: ${invoice.payment.status}
Payment Method: ${invoice.payment.method || 'N/A'}
Transaction ID: ${invoice.payment.transactionId || 'N/A'}
Paid At: ${new Date(invoice.payment.paidAt).toLocaleString()}

Thank you for your booking!
      `;
    } else {
      // Premium membership invoice
      invoiceContent = `
═══════════════════════════════════════════════════════
              HOMEHUB DIGITAL SOLUTIONS
═══════════════════════════════════════════════════════

INVOICE
Invoice Number: ${invoice.invoiceNumber}
Date: ${new Date(invoice.date).toLocaleDateString()}

CUSTOMER INFORMATION
Name: ${invoice.customer.name}
Email: ${invoice.customer.email}
Phone: ${invoice.customer.phone}
${invoice.customer.organization ? `Organization: ${invoice.customer.organization}` : ''}
${invoice.customer.role ? `Role: ${invoice.customer.role}` : ''}

PLAN DETAILS
Plan: ${invoice.plan.name}
Type: ${invoice.plan.type}
Period: ${invoice.plan.period}

PAYMENT DETAILS
Subtotal: ${invoice.amount.subtotal} ${invoice.amount.currency}
Tax: ${invoice.amount.tax} ${invoice.amount.currency}
Total: ${invoice.amount.total} ${invoice.amount.currency}

Payment Status: ${invoice.payment.status}
Payment Method: ${invoice.payment.method || 'N/A'}
Transaction ID: ${invoice.payment.transactionId || 'N/A'}
${invoice.payment.paidAt ? `Paid At: ${new Date(invoice.payment.paidAt).toLocaleString()}` : ''}

MEMBERSHIP PERIOD
Start Date: ${invoice.dates.startDate ? new Date(invoice.dates.startDate).toLocaleDateString() : 'N/A'}
End Date: ${invoice.dates.endDate ? new Date(invoice.dates.endDate).toLocaleDateString() : 'N/A'}

Thank you for your premium membership!
      `;
    }

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {isBooking && booking?.paymentMethod === 'cash' 
              ? "Booking Confirmed! 🎉"
              : "Payment Successful! 🎉"}
      </h1>
          <p className="text-gray-600">
            {isPremiumMembership 
              ? paymentMethod === 'cash'
                ? "Your premium membership has been activated. Please complete cash payment within 7 days. An invoice has been generated."
                : "Your premium membership has been activated successfully."
              : isBooking && booking?.paymentMethod === 'cash'
              ? "Your booking has been confirmed. Please pay in cash when the service is completed."
              : "Thank you for your payment. Your booking has been confirmed."}
          </p>
        </div>

        {isPremiumMembership ? (
          /* Premium Membership Invoice */
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            {/* Invoice Header with Logo */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <img 
                  src="/logo correct.png" 
                  alt="HomeHub Logo" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
                  <p className="text-sm text-gray-600">HomeHub Digital Solutions</p>
                </div>
              </div>
              {invoice && (
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : invoice ? (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                    <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Name:</span> {invoice.customer.name}</p>
                    <p><span className="font-medium">Email:</span> {invoice.customer.email}</p>
                    <p><span className="font-medium">Phone:</span> {invoice.customer.phone}</p>
                    {invoice.customer.organization && (
                      <p><span className="font-medium">Organization:</span> {invoice.customer.organization}</p>
                    )}
                    {invoice.customer.role && (
                      <p><span className="font-medium">Role:</span> {invoice.customer.role}</p>
                    )}
                  </div>
                </div>

                {/* Plan Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                    Plan Details
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Plan:</span> {invoice.plan.name}</p>
                    <p><span className="font-medium">Type:</span> {invoice.plan.type}</p>
                    <p><span className="font-medium">Period:</span> {invoice.plan.period}</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Payment Details
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Subtotal:</span>
                      <span>{invoice.amount.subtotal} {invoice.amount.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tax:</span>
                      <span>{invoice.amount.tax} {invoice.amount.currency}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-200 font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">{invoice.amount.total} {invoice.amount.currency}</span>
                    </div>
                    <div className="pt-2 border-t border-green-200 space-y-1">
                      <p><span className="font-medium">Status:</span> <span className="text-green-600 capitalize">{invoice.payment.status}</span></p>
                      {invoice.payment.method && (
                        <p><span className="font-medium">Method:</span> {invoice.payment.method}</p>
                      )}
                      {invoice.payment.transactionId && (
                        <p><span className="font-medium">Transaction ID:</span> {invoice.payment.transactionId}</p>
                      )}
                      {invoice.payment.paidAt && (
                        <p><span className="font-medium">Paid At:</span> {new Date(invoice.payment.paidAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Membership Period */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Membership Period
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Start Date:</span> {invoice.dates.startDate ? new Date(invoice.dates.startDate).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-medium">End Date:</span> {invoice.dates.endDate ? new Date(invoice.dates.endDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Invoice information not available
              </div>
            )}
          </div>
        ) : (
          /* Booking Confirmation with Invoice */
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            {/* Invoice Header with Logo */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <img 
                  src="/logo correct.png" 
                  alt="HomeHub Logo" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Booking Invoice</h2>
                  <p className="text-sm text-gray-600">HomeHub Digital Solutions</p>
                </div>
              </div>
              {invoice && (
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Invoice</span>
                </button>
              )}
            </div>

            {invoice ? (
              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                    <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-orange-600" />
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Name:</span> {invoice.customer.name}</p>
                    <p><span className="font-medium">Email:</span> {invoice.customer.email}</p>
                    <p><span className="font-medium">Phone:</span> {invoice.customer.phone}</p>
                    <p><span className="font-medium">Address:</span> {invoice.customer.address}</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                    Booking Details
                  </h3>
                  <div className="bg-orange-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Booking ID:</span> {invoice.booking.id}</p>
                    <p><span className="font-medium">Service Date:</span> {new Date(invoice.booking.date).toLocaleDateString()}</p>
                    <p><span className="font-medium">Service Time:</span> {new Date(invoice.booking.date).toLocaleTimeString()}</p>
                    <p><span className="font-medium">Status:</span> <span className="capitalize">{invoice.booking.status}</span></p>
                    {invoice.booking.note && (
                      <p><span className="font-medium">Notes:</span> {invoice.booking.note}</p>
                    )}
                  </div>
                </div>

                {/* Service Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-orange-600" />
                    Service Information
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Service:</span> {invoice.service.name}</p>
                    <p><span className="font-medium">Category:</span> {invoice.service.category}</p>
                    <p><span className="font-medium">Provider:</span> {invoice.service.provider}</p>
                    <p><span className="font-medium">Location:</span> {invoice.service.location}</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-orange-600" />
                    Payment Details
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Subtotal:</span>
                      <span>{invoice.amount.subtotal} {invoice.amount.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tax:</span>
                      <span>{invoice.amount.tax} {invoice.amount.currency}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-200 font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-green-600">{invoice.amount.total} {invoice.amount.currency}</span>
                    </div>
                    <div className="pt-2 border-t border-green-200 space-y-1">
                      <p><span className="font-medium">Status:</span> <span className="text-green-600 capitalize">{invoice.payment.status}</span></p>
                      {invoice.payment.method && (
                        <p><span className="font-medium">Method:</span> {invoice.payment.method}</p>
                      )}
                      {invoice.payment.transactionId && (
                        <p><span className="font-medium">Transaction ID:</span> {invoice.payment.transactionId}</p>
                      )}
                      {invoice.payment.paidAt && (
                        <p><span className="font-medium">Paid At:</span> {new Date(invoice.payment.paidAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">Booking confirmed successfully!</p>
                {service && (
                  <div className="space-y-2">
                    <p><span className="font-medium">Service:</span> {service.title || service.name}</p>
                    {booking?.date && (
                      <p><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
                    )}
                    <p><span className="font-medium">Amount:</span> {amount} ETB</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
          {isPremiumMembership && (
            <button
              onClick={() => {
                // Navigate to provider dashboard and show special offers
                navigate('/provider-dashboard', { 
                  state: { showSpecialOffers: true } 
                });
              }}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              Create Special Offers
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
