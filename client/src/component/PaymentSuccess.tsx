import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Download, ArrowLeft, Calendar, CreditCard, User, Building, Shield } from "lucide-react";
import QRCode from "react-qr-code";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "../api/axios";
import { useTranslation } from "react-i18next";

const PaymentSuccess = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const invoicePdfRef = useRef<HTMLDivElement>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const { type, membership, amount, booking, service, paymentMethod } = location.state || {};
  const isPremiumMembership = type === 'premium-membership';
  const isBooking = type === 'booking' || (!type && booking && service);

  // Get user role from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.role || null);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

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
      invoiceNumber: invoiceNum, // Use only 4 digits
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
      const response = await axios.get<any>(`/premium-memberships/${membership._id}/invoice`, {
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

  const handleDownloadInvoice = async () => {
    if (!invoice || !invoicePdfRef.current) return;
    
    try {
      // Capture the invoice element
      const canvas = await html2canvas(invoicePdfRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: invoicePdfRef.current.scrollWidth,
        windowHeight: invoicePdfRef.current.scrollHeight,
      });

      // Calculate PDF dimensions with margins
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const margin = 10; // 10mm margin on all sides
      const contentWidth = pdfWidth - (margin * 2);
      const contentHeight = pdfHeight - (margin * 2);
      
      // Calculate aspect ratios
      const canvasAspectRatio = canvas.width / canvas.height;
      const pageAspectRatio = contentWidth / contentHeight;
      
      let imgWidth, imgHeight;
      
      // Scale to fit within one page
      if (canvasAspectRatio > pageAspectRatio) {
        // Canvas is wider - fit to width
        imgWidth = contentWidth;
        imgHeight = contentWidth / canvasAspectRatio;
      } else {
        // Canvas is taller - fit to height
        imgHeight = contentHeight;
        imgWidth = contentHeight * canvasAspectRatio;
      }
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Center the image on the page
      const xPosition = margin + (contentWidth - imgWidth) / 2;
      const yPosition = margin + (contentHeight - imgHeight) / 2;
      
      // Add image to single page
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        xPosition,
        yPosition,
        imgWidth,
        imgHeight
      );

      // Download PDF
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(t("paymentSuccess.failedToGeneratePdf"));
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header - Compact */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {isBooking && booking?.paymentMethod === 'cash' 
              ? t("paymentSuccess.bookingConfirmedTitle")
              : t("paymentSuccess.paymentSuccessfulTitle")}
          </h1>
          <p className="text-xs text-gray-600">
            {isPremiumMembership 
              ? paymentMethod === 'cash'
                ? t("paymentSuccess.premiumCashActivated")
                : t("paymentSuccess.premiumActivated")
              : isBooking && booking?.paymentMethod === 'cash'
              ? t("paymentSuccess.bookingCashConfirmed")
              : t("paymentSuccess.bookingOnlineConfirmed")}
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
                  <h2 className="text-2xl font-bold text-gray-900">{t("invoice.title")}</h2>
                  <p className="text-sm text-gray-600">{t("invoice.brandName")}</p>
                </div>
              </div>
              {invoice && (
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t("invoice.download")}</span>
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
                    <p className="text-sm text-gray-600 mb-1">{t("invoice.invoiceNumberLabel")}</p>
                    <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t("invoice.dateLabel")}</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    {t("invoice.customerInformation")}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">{t("invoice.nameLabel")}</span> {invoice.customer.name}</p>
                    <p><span className="font-medium">{t("invoice.emailLabel")}</span> {invoice.customer.email}</p>
                    <p><span className="font-medium">{t("invoice.phoneLabel")}</span> {invoice.customer.phone}</p>
                    {invoice.customer.organization && (
                      <p><span className="font-medium">{t("invoice.organizationLabel")}</span> {invoice.customer.organization}</p>
                    )}
                    {invoice.customer.role && (
                      <p><span className="font-medium">{t("invoice.roleLabel")}</span> {invoice.customer.role}</p>
                    )}
                  </div>
                </div>

                {/* Plan Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-blue-600" />
                    {t("invoice.planDetails")}
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">{t("invoice.planLabel")}</span> {invoice.plan.name}</p>
                    <p><span className="font-medium">{t("invoice.typeLabel")}</span> {invoice.plan.type}</p>
                    <p><span className="font-medium">{t("invoice.periodLabel")}</span> {invoice.plan.period}</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    {t("invoice.paymentDetails")}
                  </h3>
                  <div className="bg-green-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{t("invoice.subtotalLabel")}</span>
                      <span>{invoice.amount.subtotal} {invoice.amount.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("invoice.taxLabel")}</span>
                      <span>{invoice.amount.tax} {invoice.amount.currency}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-200 font-bold text-lg">
                      <span>{t("invoice.totalLabel")}</span>
                      <span className="text-green-600">{invoice.amount.total} {invoice.amount.currency}</span>
                    </div>
                    <div className="pt-2 border-t border-green-200 space-y-1">
                      <p><span className="font-medium">{t("invoice.statusLabel")}</span> <span className="text-green-600 capitalize">{invoice.payment.status}</span></p>
                      {invoice.payment.method && (
                        <p><span className="font-medium">{t("invoice.methodLabel")}</span> {invoice.payment.method}</p>
                      )}
                      {invoice.payment.transactionId && (
                        <p><span className="font-medium">{t("invoice.transactionIdLabel")}</span> {invoice.payment.transactionId}</p>
                      )}
                      {invoice.payment.paidAt && (
                        <p><span className="font-medium">{t("invoice.paidAtLabel")}</span> {new Date(invoice.payment.paidAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Membership Period */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    {t("invoice.membershipPeriod")}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">{t("invoice.startDateLabel")}</span> {invoice.dates.startDate ? new Date(invoice.dates.startDate).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-medium">{t("invoice.endDateLabel")}</span> {invoice.dates.endDate ? new Date(invoice.dates.endDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {t("invoice.invoiceInformationNotAvailable")}
              </div>
            )}
          </div>
        ) : (
          /* Booking Confirmation with Invoice - Receipt Style, Single Page */
          <div ref={invoiceRef} className="bg-white shadow-lg p-4 md:p-5 mb-6 max-w-2xl mx-auto border-2 border-gray-400">
            {invoice ? (
              <div className="space-y-2 text-xs" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                {/* Header with Logo and Invoice Info - Receipt Style */}
                <div className="text-center border-b-2 border-gray-400 pb-2 mb-2">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <img 
                      src="/logo correct.png" 
                    alt={t("invoice.brandName")}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <h2 className="text-sm font-bold text-gray-900">{t("invoice.brandName")}</h2>
                  </div>
                  <div className="text-xs space-y-0.5">
                    <p className="text-gray-700">
                      {t("invoice.invoiceDateLabel")} {new Date(invoice.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-gray-700">
                      {t("invoice.invoiceNumberShortLabel")} {invoice.invoiceNumber}
                    </p>
                  </div>
                </div>

                {/* Company Information - Receipt Style */}
                <div className="text-center border-b border-gray-300 pb-2 mb-2">
                  <p className="text-xs font-semibold text-gray-900">{t("invoice.brandName")}</p>
                  <p className="text-xs text-gray-600">{t("invoice.companyTinAddress")}</p>
                  <p className="text-xs text-gray-600">Homehub Address</p>
                  <p className="text-xs text-gray-600">22, Negat Building, 5th Floor.</p>
                  <p className="text-xs text-gray-600">
                    {t("invoice.phoneLabel")} <a href="tel:+251994578759" className="underline text-gray-700">+251 994 578 759</a>
                  </p>
                </div>

                {/* Customer Information - Receipt Style */}
                <div className="border-b border-gray-300 pb-2 mb-2">
                  <p className="text-xs font-semibold text-gray-900">{t("invoice.customerLabel")} {invoice.customer.name}</p>
                  <p className="text-xs text-gray-600 flex items-center">
                    <span className="mr-1">⏳</span>
                    {t("invoice.statusPendingPayment")}
                  </p>
                </div>

                {/* Service Details - Receipt Style */}
                <div className="border-t border-b border-gray-400 py-2 my-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">{invoice.service.name}</p>
                        <p className="text-xs text-gray-600">{invoice.service.category}</p>
                        <p className="text-xs text-gray-600">{invoice.service.location}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xs font-bold text-gray-900">{invoice.amount.total.toFixed(2)} ETB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary - Receipt Style */}
                <div className="border-t-2 border-b-2 border-gray-400 py-2 my-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-900">{t("invoice.totalAmountDueLabel")}</span>
                    <span className="text-sm font-bold text-gray-900">{invoice.amount.total.toFixed(2)} ETB</span>
                  </div>
                </div>

                {/* Status - Receipt Style */}
                <div className="text-center border-b border-gray-300 pb-2 mb-2">
                  <p className="text-xs text-gray-600 flex items-center justify-center">
                    <span className="mr-1">⏳</span>
                    {t("invoice.statusPending")}
                  </p>
                </div>

                {/* QR Code Section - Receipt Style */}
                <div className="text-center border-t border-gray-300 pt-2 mt-2">
                  <p className="text-xs font-semibold text-gray-700 mb-1">{t("invoice.scanToVerifyLabel")}</p>
                  <div className="flex justify-center">
                    <div className="bg-white p-2 border-2 border-gray-400">
                      {invoice && (
                        <QRCode
                          value={`INVOICE:${invoice.invoiceNumber}|DATE:${new Date(invoice.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}|AMOUNT:${invoice.amount.total} ${invoice.amount.currency}|CUSTOMER:${invoice.customer.name}|SERVICE:${invoice.service.name}|COMPANY:HomeHub Digital Solutions`}
                          size={80}
                          level="M"
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    <p>Homehub Address</p>
                    <p>22, Negat Building, 5th Floor.</p>
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleDownloadInvoice}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t("invoice.downloadInvoice")}</span>
                  </button>
                  {invoice.payment.status === 'pending' && (
                    <button
                      onClick={() => {
                        navigate('/payment', {
                          state: {
                            booking: booking,
                            service: service,
                            amount: invoice.amount.total,
                            type: 'booking'
                          }
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-semibold"
                    >
                      {t("paymentSuccess.completePurchase")}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">{t("paymentSuccess.bookingConfirmedSuccessfully")}</p>
                {service && (
                  <div className="space-y-2">
                    <p><span className="font-medium">{t("paymentSuccess.serviceLabel")}</span> {service.title || service.name}</p>
                    {booking?.date && (
                      <p><span className="font-medium">{t("paymentSuccess.dateLabel")}</span> {new Date(booking.date).toLocaleDateString()}</p>
                    )}
                    <p><span className="font-medium">{t("paymentSuccess.amountLabel")}</span> {amount} ETB</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hidden Invoice for PDF Generation (without buttons) */}
        {invoice && isBooking && (
          <div ref={invoicePdfRef} className="fixed -left-[9999px] top-0 bg-white shadow-lg p-4 md:p-5 max-w-2xl border-2 border-gray-400">
            <div className="space-y-2 text-xs" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
              {/* Header with Logo and Invoice Info - Receipt Style */}
              <div className="text-center border-b-2 border-gray-400 pb-2 mb-2">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <img 
                    src="/logo correct.png" 
                    alt={t("invoice.brandName")}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <h2 className="text-sm font-bold text-gray-900">{t("invoice.brandName")}</h2>
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="text-gray-700">
                    {t("invoice.invoiceDateLabel")} {new Date(invoice.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-gray-700">
                    {t("invoice.invoiceNumberShortLabel")} {invoice.invoiceNumber}
                  </p>
                </div>
              </div>

              {/* Company Information - Receipt Style */}
              <div className="text-center border-b border-gray-300 pb-1 mb-1">
                <p className="text-xs font-semibold text-gray-900">{t("invoice.brandName")}</p>
                  <p className="text-xs text-gray-600">{t("invoice.companyTinAddress")}</p>
                  <p className="text-xs text-gray-600">Homehub Address</p>
                  <p className="text-xs text-gray-600">22, Negat Building, 5th Floor.</p>
                <p className="text-xs text-gray-600">
                    {t("invoice.phoneLabel")} <a href="tel:+251994578759" className="underline text-gray-700">+251 994 578 759</a>
                </p>
              </div>

              {/* Customer Information - Receipt Style */}
              <div className="border-b border-gray-300 pb-1 mb-1">
                <p className="text-xs font-semibold text-gray-900">{t("invoice.customerLabel")} {invoice.customer.name}</p>
                <p className="text-xs text-gray-600 flex items-center">
                  <span className="mr-1">⏳</span>
                  {t("invoice.statusPendingPayment")}
                </p>
              </div>

              {/* Service Details - Receipt Style */}
              <div className="border-t border-b border-gray-400 py-1 my-1">
                <div className="space-y-0.5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">{invoice.service.name}</p>
                      <p className="text-xs text-gray-600">{invoice.service.category}</p>
                      <p className="text-xs text-gray-600">{invoice.service.location}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs font-bold text-gray-900">{invoice.amount.total.toFixed(2)} ETB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Summary - Receipt Style */}
              <div className="border-t-2 border-b-2 border-gray-400 py-1 my-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-900">{t("invoice.totalAmountDueLabel")}</span>
                  <span className="text-xs font-bold text-gray-900">{invoice.amount.total.toFixed(2)} ETB</span>
                </div>
              </div>

              {/* Status - Receipt Style */}
              <div className="text-center border-b border-gray-300 pb-1 mb-1">
                <p className="text-xs text-gray-600 flex items-center justify-center">
                  <span className="mr-1">⏳</span>
                  {t("invoice.statusPending")}
                </p>
              </div>

              {/* QR Code Section - Receipt Style */}
              <div className="text-center border-t border-gray-300 pt-1 mt-1">
                <p className="text-xs font-semibold text-gray-700 mb-0.5">{t("invoice.scanToVerifyLabel")}</p>
                <div className="flex justify-center">
                  <div className="bg-white p-1 border-2 border-gray-400">
                    <QRCode
                      value={`INVOICE:${invoice.invoiceNumber}|DATE:${new Date(invoice.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}|AMOUNT:${invoice.amount.total} ${invoice.amount.currency}|CUSTOMER:${invoice.customer.name}|SERVICE:${invoice.service.name}|COMPANY:HomeHub Digital Solutions`}
                      size={50}
                      level="M"
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  <p>Homehub Address</p>
                  <p>22, Negat Building, 5th Floor.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Back to Home */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t("paymentSuccess.backToHome")}</span>
          </button>
          {isPremiumMembership && userRole === 'provider' && (
            <button
              onClick={() => {
                // Navigate to provider dashboard and show special offers
                navigate('/provider-dashboard', { 
                  state: { showSpecialOffers: true } 
                });
              }}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              {t("paymentSuccess.createSpecialOffers")}
            </button>
          )}
          {isPremiumMembership && userRole === 'seeker' && (
            <>
              <button
                onClick={() => navigate('/services')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                {t("paymentSuccess.browseServices")}
              </button>
              <button
                onClick={() => navigate('/seeker-dashboard')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                {t("paymentSuccess.goToDashboard")}
              </button>
            </>
          )}
        </div>
        
        {/* Premium Access Info for Service Seekers */}
        {isPremiumMembership && userRole === 'seeker' && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {t("paymentSuccess.premiumAccessActivatedTitle")}
                </h3>
                <p className="text-gray-700 mb-3">
                  {t("paymentSuccess.premiumAccessActivatedDescription")}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                  <li>{t("paymentSuccess.premiumAccessBullet1")}</li>
                  <li>{t("paymentSuccess.premiumAccessBullet2")}</li>
                  <li>{t("paymentSuccess.premiumAccessBullet3")}</li>
                  <li>{t("paymentSuccess.premiumAccessBullet4")}</li>
                </ul>
                <p className="text-sm font-semibold text-purple-700">
                  {t("paymentSuccess.premiumAccessExploreNote", {
                    buttonLabel: t("paymentSuccess.viewProviderDetailsButton")
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
