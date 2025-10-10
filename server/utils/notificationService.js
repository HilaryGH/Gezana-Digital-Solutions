const { sendWelcomeEmail, sendServicePublishedEmail, sendBookingConfirmationEmail } = require('./emailService');
const { 
  sendWelcomeWhatsApp, 
  sendServicePublishedWhatsApp,
  sendBookingConfirmationWhatsApp,
  sendBookingReminderWhatsApp 
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

// Send booking reminder notifications
const sendBookingReminderNotifications = async (userData, bookingDetails) => {
  const { phone, whatsapp, name } = userData;
  
  const whatsappNumber = whatsapp || phone;
  if (whatsappNumber) {
    return await sendBookingReminderWhatsApp(whatsappNumber, name, bookingDetails);
  }

  return { success: false, error: 'No phone number available' };
};

module.exports = {
  sendWelcomeNotifications,
  sendServicePublishedNotifications,
  sendBookingConfirmationNotifications,
  sendBookingReminderNotifications
};

