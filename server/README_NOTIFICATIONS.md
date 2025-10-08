# 🎉 Gezana Notification System

A complete email and WhatsApp notification system for Gezana Digital Solutions platform.

## 📋 Table of Contents
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Email Notifications (Nodemailer)
- ✅ **Beautiful HTML Templates** - Responsive, modern design with Gezana branding
- ✅ **Welcome Emails** - Sent automatically on user registration
- ✅ **Service Published** - Confirmation when providers add services
- ✅ **Role-Specific Content** - Different templates for providers and seekers
- ✅ **Professional Design** - Gradient backgrounds, mobile-responsive

### WhatsApp Notifications (Twilio)
- ✅ **Instant Messages** - Real-time WhatsApp notifications
- ✅ **Welcome Messages** - Personalized greetings for new users
- ✅ **Service Alerts** - Notifications when services are published
- ✅ **Booking Confirmations** - Receipt and details via WhatsApp
- ✅ **Reminders** - Automated booking reminders

## 🚀 Quick Start

### 1. Installation

Dependencies are already installed, but if needed:

```bash
cd server
npm install
```

### 2. Environment Setup

Add these variables to your `.env` file:

```env
# Email Configuration (Gmail)
EMAIL_USER=g.fikre2@gmail.com
EMAIL_PASSWORD=your-app-password-here

# WhatsApp Configuration (Twilio) - Optional
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14155238886
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Other Settings
CLIENT_URL=http://localhost:5173
```

### 3. Gmail Setup

**Get App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **Mail** and **Other (Custom name)**
5. Name it "Gezana" and click **Generate**
6. Copy the 16-character password
7. Add to `.env` as `EMAIL_PASSWORD`

### 4. Twilio Setup (Optional for WhatsApp)

**Create Account:**
1. Sign up at [Twilio](https://www.twilio.com/try-twilio)
2. Verify your phone number
3. Get your trial credits

**Get WhatsApp Sandbox:**
1. In Twilio Console: **Messaging** → **Try WhatsApp**
2. Follow instructions to join sandbox (send code to Twilio number)
3. Copy your **Account SID**, **Auth Token**, and **WhatsApp Number**
4. Add to `.env`

**Important:** In trial mode, recipients must join your Twilio sandbox before receiving messages.

## 📧 Configuration

### Current Setup

The notification system is already integrated into:

1. **Registration** (`server/routes/auth.js`)
   - Sends welcome email + WhatsApp on user signup
   - Different templates for providers vs seekers

2. **Service Creation** (`server/routes/services.js`)
   - Sends confirmation when provider adds a service
   - Email + WhatsApp notification

### Email Templates

Located in `server/utils/emailService.js`:
- Welcome email with gradient design
- Service published confirmation
- Fully responsive HTML
- Customizable branding

### WhatsApp Templates

Located in `server/utils/whatsappService.js`:
- Welcome message with quick tips
- Service published alert
- Booking confirmation (ready to use)
- Booking reminder (ready to use)

## 🧪 Testing

### Using NPM Scripts

```bash
# Test both email and WhatsApp
npm run test:notifications

# Test email only
npm run test:email

# Test WhatsApp only
npm run test:whatsapp
```

### Manual Testing

Edit `test-notifications.js` with your test data:

```javascript
const testUser = {
  email: 'your-test-email@example.com',
  name: 'Test User',
  role: 'provider',
  phone: '+251911234567',
  whatsapp: '+251911234567'
};
```

Then run:
```bash
node test-notifications.js
```

### Preview Email Template

Open `server/email-preview.html` in your browser to see how the email looks.

## 📱 Usage Examples

### Send Welcome Notifications

```javascript
const { sendWelcomeNotifications } = require('./utils/notificationService');

await sendWelcomeNotifications({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'provider', // or 'seeker'
  phone: '+251911234567',
  whatsapp: '+251911234567'
});
```

### Send Service Published Notifications

```javascript
const { sendServicePublishedNotifications } = require('./utils/notificationService');

await sendServicePublishedNotifications({
  email: 'provider@example.com',
  name: 'ABC Trading',
  phone: '+251911234567',
  whatsapp: '+251911234567'
}, 'Professional Cleaning Service');
```

### Send Booking Confirmation

```javascript
const { sendBookingConfirmationNotifications } = require('./utils/notificationService');

await sendBookingConfirmationNotifications({
  email: 'user@example.com',
  name: 'John Doe',
  phone: '+251911234567',
  whatsapp: '+251911234567'
}, {
  serviceName: 'Home Cleaning',
  providerName: 'ABC Cleaning Co.',
  date: '2025-01-15',
  time: '10:00 AM',
  price: '500'
});
```

## 🎨 Customization

### Change Email Colors

In `server/utils/emailService.js`, find and modify:

```javascript
// Header gradient
style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);"

// Button gradient
style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);"
```

Replace `#f97316` and `#ea580c` with your brand colors.

### Update Logo

Replace the logo in the email template:

```javascript
<img src="YOUR_LOGO_URL" alt="Gezana Logo" style="width: 80px; height: 80px;">
```

### Modify WhatsApp Messages

In `server/utils/whatsappService.js`, edit the message templates:

```javascript
const message = `🎉 *Welcome to Gezana, ${userName}!*

Your custom message here...`;
```

### Add New Notification Types

Create new functions in `emailService.js` or `whatsappService.js`:

```javascript
const sendCustomNotification = async (email, data) => {
  const template = getCustomTemplate(data);
  // ... send email
};
```

## 🐛 Troubleshooting

### Email Issues

**Problem:** Email not sending

**Solutions:**
1. ✅ Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
2. ✅ Use App Password, not regular Gmail password
3. ✅ Enable 2-Step Verification on Gmail account
4. ✅ Check spam/junk folder
5. ✅ Review server console for error messages
6. ✅ Test with `npm run test:email`

**Problem:** "Invalid login" error

**Solutions:**
1. ✅ Regenerate App Password
2. ✅ Ensure no spaces in password
3. ✅ Check if Gmail account has 2FA enabled

### WhatsApp Issues

**Problem:** WhatsApp message not delivering

**Solutions:**
1. ✅ Verify Twilio credentials in `.env`
2. ✅ Check `TWILIO_WHATSAPP_NUMBER` format: `whatsapp:+1234567890`
3. ✅ Ensure recipient joined Twilio sandbox (trial mode)
4. ✅ Check Twilio console for delivery status
5. ✅ Verify trial account limits not exceeded
6. ✅ Test with `npm run test:whatsapp`

**Problem:** Recipient not receiving messages

**Solutions:**
1. ✅ In trial mode, recipient must join sandbox first
2. ✅ Send sandbox join code to recipient's WhatsApp
3. ✅ Check recipient's phone number format: `+[country code][number]`
4. ✅ Review Twilio console logs

### General Issues

**Problem:** Notifications not triggering on registration

**Solutions:**
1. ✅ Check server console for errors
2. ✅ Verify `.env` file is loaded (`process.env.EMAIL_USER`)
3. ✅ Test notifications independently first
4. ✅ Check import paths in routes
5. ✅ Ensure `dotenv` is configured in `index.js`

## 📊 Files Structure

```
server/
├── utils/
│   ├── emailService.js           # Email functions and templates
│   ├── whatsappService.js        # WhatsApp functions and templates
│   └── notificationService.js    # Unified notification API
├── routes/
│   ├── auth.js                   # Registration with notifications
│   └── services.js               # Service creation with notifications
├── test-notifications.js         # Test script
├── email-preview.html            # Email template preview
├── env.example.txt               # Environment variables template
├── NOTIFICATION_SETUP.md         # Detailed setup guide
├── NOTIFICATION_SUMMARY.md       # Implementation summary
└── README_NOTIFICATIONS.md       # This file
```

## 🔒 Security

- ✅ All credentials in `.env` (not committed to git)
- ✅ Using App Passwords for Gmail (more secure)
- ✅ Twilio API with secure tokens
- ✅ Non-blocking error handling
- ✅ Graceful failure (won't break registration)

## 📈 Production Checklist

Before deploying to production:

- [ ] Use production email service (not trial)
- [ ] Request WhatsApp Business API access from Twilio
- [ ] Set up email templates review
- [ ] Configure email sending limits
- [ ] Set up monitoring for failed notifications
- [ ] Add retry logic for failed sends
- [ ] Set up notification queuing system
- [ ] Configure proper error logging
- [ ] Test with real user data
- [ ] Update URLs in templates to production

## 🆘 Support

**For help:**
- Check server console logs for errors
- Review `NOTIFICATION_SETUP.md` for detailed setup
- Test with `test-notifications.js`
- Check Gmail/Twilio dashboards
- Review error messages in console

**Contact:**
- Email: g.fikre2@gmail.com
- Phone: +251 911 508 734

---

**Made with ❤️ for Gezana Digital Solutions** 🚀

*Last Updated: January 2025*

