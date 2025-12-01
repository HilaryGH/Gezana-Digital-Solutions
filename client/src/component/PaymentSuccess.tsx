import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Download, ArrowLeft, FileText, Calendar, CreditCard, User, Building } from "lucide-react";
import axios from "../api/axios";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { type, membership, amount, planName, transactionId, booking, service } = location.state || {};
  const isPremiumMembership = type === 'premium-membership';

  useEffect(() => {
    if (isPremiumMembership && membership?._id) {
      fetchInvoice();
      // Set flag to refresh premium status in SpecialOffers component
      sessionStorage.setItem('premiumPaymentSuccess', 'true');
    }
  }, [isPremiumMembership, membership]);

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
    
    const invoiceContent = `
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
            Payment Successful! 🎉
      </h1>
          <p className="text-gray-600">
            {isPremiumMembership 
              ? "Your premium membership has been activated successfully."
              : "Thank you for your payment. Your booking has been confirmed."}
          </p>
        </div>

        {isPremiumMembership ? (
          /* Premium Membership Invoice */
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
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
          /* Booking Confirmation */
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed</h2>
            {service && (
              <div className="space-y-4">
                <p><span className="font-medium">Service:</span> {service.title}</p>
                {booking?.date && (
                  <p><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
                )}
                <p><span className="font-medium">Amount:</span> {amount} ETB</p>
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
