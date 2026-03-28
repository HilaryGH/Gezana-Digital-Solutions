const {
  getSmtpUser,
  sendWelcomeEmail,
  sendServicePublishedEmail,
  sendBookingConfirmationEmail,
  sendInternalProfessionalBookingAlert,
  sendProviderBookingAlertEmail,
  sendServiceRequestConfirmationEmail,
  sendInternalServiceRequestAlert,
} = require('./emailService');
const { 
  sendWelcomeWhatsApp, 
  sendServicePublishedWhatsApp,
  sendBookingConfirmationWhatsApp,
  sendBookingReminderWhatsApp,
  sendServiceRequestConfirmationWhatsApp,
} = require('./whatsappService');

// Send welcome notifications (Email + WhatsApp)
const sendWelcomeNotifications = async (userData) => {
  const { email, name, role, phone, whatsapp } = userData;
  
  const results = {
    email: null,
    whatsapp: null
  };

  // Send welcome email
  if (email) {
    results.email = await sendWelcomeEmail(email, name, role);
  }

  // Send WhatsApp message (prefer whatsapp number, fallback to phone)
  const whatsappNumber = whatsapp || phone;
  if (whatsappNumber) {
    results.whatsapp = await sendWelcomeWhatsApp(whatsappNumber, name, role);
  }

  return results;
};

// Send service published notifications
const sendServicePublishedNotifications = async (providerData, serviceName) => {
  const { email, name, phone, whatsapp } = providerData;
  
  const results = {
    email: null,
    whatsapp: null
  };

  // Send email notification
  if (email) {
    results.email = await sendServicePublishedEmail(email, name, serviceName);
  }

  // Send WhatsApp notification
  const whatsappNumber = whatsapp || phone;
  if (whatsappNumber) {
    results.whatsapp = await sendServicePublishedWhatsApp(whatsappNumber, name, serviceName);
  }

  return results;
};

// Send booking confirmation notifications
const sendBookingConfirmationNotifications = async (userData, bookingDetails) => {
  const { email, name, phone, whatsapp } = userData;
  
  const results = {
    email: null,
    whatsapp: null
  };

  // Send booking confirmation email
  if (email) {
    results.email = await sendBookingConfirmationEmail(email, name, bookingDetails);
  }

  // Send WhatsApp notification (primary for bookings)
  const whatsappNumber = whatsapp || phone;
  if (whatsappNumber) {
    results.whatsapp = await sendBookingConfirmationWhatsApp(whatsappNumber, name, bookingDetails);
  }

  return results;
};

/**
 * Email listing agent + optional superadmin when an agent-listed professional is booked.
 */
const sendProfessionalBookingStakeholderEmails = async (stakeholders, payload) => {
  const results = { agent: null, superadmin: null };
  if (stakeholders.agentEmail) {
    results.agent = await sendInternalProfessionalBookingAlert(
      stakeholders.agentEmail,
      stakeholders.agentName || "Agent",
      payload
    );
  }
  const adminEmail = process.env.SUPERADMIN_BOOKING_ALERT_EMAIL || process.env.SUPERADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    results.superadmin = await sendInternalProfessionalBookingAlert(
      adminEmail,
      "Superadmin",
      payload
    );
  }
  return results;
};

// Send booking reminder notifications
const sendBookingReminderNotifications = async (userData, bookingDetails) => {
  const { phone, whatsapp, name } = userData;
  
  const whatsappNumber = whatsapp || phone;
  if (whatsappNumber) {
    return await sendBookingReminderWhatsApp(whatsappNumber, name, bookingDetails);
  }

  return { success: false, error: 'No phone number available' };
};

const sendServiceRequestNotifications = async ({ requester, requestDetails }) => {
  const { email, name, phone, whatsapp } = requester;
  const results = {
    requesterEmail: null,
    requesterWhatsApp: null,
    internalEmail: null,
  };

  if (email) {
    results.requesterEmail = await sendServiceRequestConfirmationEmail(email, name, requestDetails);
  }

  const whatsappNumber = whatsapp || phone;
  if (whatsappNumber) {
    results.requesterWhatsApp = await sendServiceRequestConfirmationWhatsApp(
      whatsappNumber,
      name,
      requestDetails
    );
  }

  const internalEmail =
    process.env.SERVICE_REQUEST_ALERT_EMAIL ||
    process.env.SUPERADMIN_NOTIFICATION_EMAIL ||
    getSmtpUser();
  if (internalEmail) {
    results.internalEmail = await sendInternalServiceRequestAlert(internalEmail, {
      requestId: requestDetails.requestId,
      requesterName: name,
      requesterEmail: email,
      requesterPhone: phone,
      serviceNeeded: requestDetails.serviceNeeded,
      location: requestDetails.location,
      preferredDate: requestDetails.preferredDate,
      budgetEtb: requestDetails.budgetEtb,
    });
  }

  return results;
};

const sendProviderBookingNotification = async ({ provider, bookingDetails, customer }) => {
  if (!provider?.email) {
    return { success: false, error: "Provider email is missing" };
  }

  return sendProviderBookingAlertEmail(
    provider.email,
    provider.name || "Provider",
    {
      serviceName: bookingDetails.serviceName,
      customerName: customer?.name || "Customer",
      customerEmail: customer?.email || "",
      customerPhone: customer?.phone || "",
      date: bookingDetails.date,
      time: bookingDetails.time,
      location: bookingDetails.location,
      priceEtb: bookingDetails.price,
      note: bookingDetails.note || "",
    }
  );
};

module.exports = {
  sendWelcomeNotifications,
  sendServicePublishedNotifications,
  sendBookingConfirmationNotifications,
  sendProfessionalBookingStakeholderEmails,
  sendBookingReminderNotifications,
  sendServiceRequestNotifications,
  sendProviderBookingNotification,
};

