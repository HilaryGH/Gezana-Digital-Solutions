const twilio = require('twilio');

// Initialize Twilio client
const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    console.warn('⚠️ Twilio credentials not configured');
    return null;
  }
  
  return twilio(accountSid, authToken);
};

// Format phone number for WhatsApp
const formatPhoneNumber = (phone) => {
  // If already formatted with whatsapp: prefix, return as is
  if (phone.startsWith('whatsapp:')) {
    return phone;
  }
  
  // Remove any spaces, dashes, or special characters
  let formatted = phone.replace(/[\s\-\(\)]/g, '');
  
  // Add 'whatsapp:' prefix and ensure it starts with +
  if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  
  return 'whatsapp:' + formatted;
};

// Send welcome WhatsApp message
const sendWelcomeWhatsApp = async (phoneNumber, userName, userRole) => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.log('⚠️ Twilio not configured, skipping WhatsApp notification');
      return { success: false, error: 'Twilio not configured' };
    }

    const message = userRole === 'provider' 
      ? `🎉 *Welcome to Gezana, ${userName}!*

Your Provider account is now active! 🚀

✅ Start adding your services
💰 Set your own pricing
📊 Manage bookings easily
⭐ Build your reputation

Get started now: ${process.env.CLIENT_URL || 'http://localhost:5173'}

Need help? Reply to this message or call +25199 457 8759

_Gezana Digital Solutions - Connecting Services, Building Trust_ 🤝`
      : `🎉 *Welcome to Gezana, ${userName}!*

Your account is ready! 🌟

🔍 Browse verified services
📅 Book at your convenience
⭐ Rate and review providers
🎁 Earn loyalty points

Explore services: ${process.env.CLIENT_URL || 'http://localhost:5173'}

Need help? Reply to this message or call +25199 457 8759

_Gezana Digital Solutions - Your Trusted Service Marketplace_ 💼`;

    const response = await client.messages.create({
      from: formatPhoneNumber(process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER),
      to: formatPhoneNumber(phoneNumber),
      body: message
    });

    console.log('✅ Welcome WhatsApp sent successfully:', response.sid);
    return { success: true, messageSid: response.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    return { success: false, error: error.message };
  }
};

// Send service published WhatsApp notification
const sendServicePublishedWhatsApp = async (phoneNumber, userName, serviceName) => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.log('⚠️ Twilio not configured, skipping WhatsApp notification');
      return { success: false, error: 'Twilio not configured' };
    }

    const message = `🎊 *Service Published Successfully!*

Hi ${userName},

Your service *"${serviceName}"* is now live on Gezana! 🌟

Customers can now:
✅ View your service
📅 Book appointments
💬 Contact you directly

Track your bookings: ${process.env.CLIENT_URL || 'http://localhost:5173'}/provider/dashboard

_Keep your service updated for better visibility!_ 📈

Gezana - Your Partner in Success 🚀`;

    const response = await client.messages.create({
      from: formatPhoneNumber(process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER),
      to: formatPhoneNumber(phoneNumber),
      body: message
    });

    console.log('✅ Service published WhatsApp sent:', response.sid);
    return { success: true, messageSid: response.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation WhatsApp
const sendBookingConfirmationWhatsApp = async (phoneNumber, userName, bookingDetails) => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      console.log('⚠️ Twilio not configured, skipping WhatsApp notification');
      return { success: false, error: 'Twilio not configured' };
    }

    const message = `📅 *Booking Confirmed!*

Hi ${userName},

Your booking has been confirmed! 🎉

*Service:* ${bookingDetails.serviceName}
*Provider:* ${bookingDetails.providerName}
*Date:* ${bookingDetails.date}
*Time:* ${bookingDetails.time}
*Total:* ${bookingDetails.price} ETB

View details: ${process.env.CLIENT_URL || 'http://localhost:5173'}/bookings

_We'll notify you before your appointment_ ⏰

Questions? Reply to this message!

Gezana - Service Made Simple 💼`;

    const response = await client.messages.create({
      from: formatPhoneNumber(process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER),
      to: formatPhoneNumber(phoneNumber),
      body: message
    });

    console.log('✅ Booking confirmation WhatsApp sent:', response.sid);
    return { success: true, messageSid: response.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    return { success: false, error: error.message };
  }
};

// Send booking reminder WhatsApp
const sendBookingReminderWhatsApp = async (phoneNumber, userName, bookingDetails) => {
  try {
    const client = createTwilioClient();
    
    if (!client) {
      return { success: false, error: 'Twilio not configured' };
    }

    const message = `⏰ *Booking Reminder*

Hi ${userName},

Your appointment is tomorrow! 📅

*Service:* ${bookingDetails.serviceName}
*Provider:* ${bookingDetails.providerName}
*Time:* ${bookingDetails.time}
*Location:* ${bookingDetails.location || 'TBD'}

Please be on time! ⌚

Need to reschedule? Contact us ASAP.

Gezana - Your Service Partner 🤝`;

    const response = await client.messages.create({
      from: formatPhoneNumber(process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER),
      to: formatPhoneNumber(phoneNumber),
      body: message
    });

    console.log('✅ Booking reminder WhatsApp sent:', response.sid);
    return { success: true, messageSid: response.sid };
  } catch (error) {
    console.error('❌ Error sending WhatsApp reminder:', error.message);
    return { success: false, error: error.message };
  }
};

const sendServiceRequestConfirmationWhatsApp = async (phoneNumber, userName, requestDetails) => {
  try {
    const client = createTwilioClient();
    if (!client) {
      return { success: false, error: "Twilio not configured" };
    }

    const message = `✅ *Service Request Received*

Hi ${userName},

We've received your request successfully.

*Request ID:* ${requestDetails.requestId}
*Service:* ${requestDetails.serviceNeeded}
*Location:* ${requestDetails.location}

Our team will contact you soon with the best provider options.

HomeHub Digital Solutions`;

    const response = await client.messages.create({
      from: formatPhoneNumber(process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER),
      to: formatPhoneNumber(phoneNumber),
      body: message
    });

    return { success: true, messageSid: response.sid };
  } catch (error) {
    console.error("❌ Error sending service request WhatsApp:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeWhatsApp,
  sendServicePublishedWhatsApp,
  sendBookingConfirmationWhatsApp,
  sendBookingReminderWhatsApp,
  sendServiceRequestConfirmationWhatsApp,
  formatPhoneNumber
};

