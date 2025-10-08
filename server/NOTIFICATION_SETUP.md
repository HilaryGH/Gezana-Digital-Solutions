# 📧 Notification System Setup Guide

This guide will help you set up email and WhatsApp notifications for Gezana.

## 🎯 Features

- ✅ **Welcome Email** - Beautiful HTML email sent on registration
- ✅ **Welcome WhatsApp** - Instant WhatsApp message on registration  
- ✅ **Service Published Notifications** - Email & WhatsApp when provider adds a service
- ✅ **Booking Confirmations** - WhatsApp notifications for bookings
- ✅ **Booking Reminders** - Automated WhatsApp reminders

## 📧 Email Setup (Nodemailer + Gmail)

### Step 1: Enable Gmail App Passwords

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security**
3. Under "Signing in to Google", select **2-Step Verification** (enable if not already)
4. At the bottom, select **App passwords**
5. Select **Mail** and **Other (Custom name)**, name it "Gezana"
6. Click **Generate**
7. Copy the 16-character password

### Step 2: Add to .env file

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

## 📱 WhatsApp Setup (Twilio)

### Step 1: Create Twilio Account

1. Sign up at: https://www.twilio.com/try-twilio
2. Complete phone verification
3. Get your free trial credits

### Step 2: Get WhatsApp Sandbox

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to join your sandbox (send a code to Twilio WhatsApp number)
3. Copy your sandbox WhatsApp number

### Step 3: Get API Credentials

1. Go to Twilio Console Dashboard
2. Find **Account SID** and **Auth Token**
3. Copy both values

### Step 4: Add to .env file

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14155238886
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Note for Production:**
- For production, you need to request WhatsApp Business API access
- Trial accounts have limitations (message templates, recipient numbers)
- Recipients must join your sandbox in trial mode

## 🔧 Configuration

### Complete .env file example:

```env
# Server
PORT=5000
MONGO_URI=mongodb://localhost:27017/gezana
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14155238886
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 🧪 Testing Notifications

### Test Welcome Email

```javascript
// In server console or test script
const { sendWelcomeEmail } = require('./utils/emailService');

sendWelcomeEmail('test@example.com', 'Test User', 'provider');
```

### Test WhatsApp

```javascript
const { sendWelcomeWhatsApp } = require('./utils/whatsappService');

// Make sure recipient has joined Twilio sandbox
sendWelcomeWhatsApp('+251911234567', 'Test User', 'seeker');
```

## 📋 Notification Templates

### Email Templates
- Located in: `server/utils/emailService.js`
- Fully responsive HTML design
- Gradient backgrounds and modern styling
- Role-specific content (Provider vs Seeker)

### WhatsApp Templates
- Located in: `server/utils/whatsappService.js`
- Clean text format with emojis
- Quick action links
- Personalized messages

## 🚀 Usage in Application

### Automatic Notifications

1. **Registration**: Automatically sent when user registers
2. **Service Creation**: Sent when provider adds a service
3. **Booking**: Can be integrated in booking flow

### Manual Sending

```javascript
const { sendWelcomeNotifications } = require('./utils/notificationService');

// Send both email and WhatsApp
await sendWelcomeNotifications({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'provider',
  phone: '+251911234567',
  whatsapp: '+251911234567'
});
```

## ⚠️ Important Notes

### Gmail
- Use App Passwords, not regular password
- Less secure app access won't work anymore
- Enable 2-Step Verification first

### Twilio WhatsApp
- Trial account requires recipients to join sandbox
- Production needs WhatsApp Business API approval
- Check pricing for production usage
- Message templates may be required for production

### Error Handling
- Notifications are non-blocking
- Failed notifications won't stop registration/service creation
- Errors are logged but not returned to client

## 🎨 Customization

### Email Templates
Edit `server/utils/emailService.js`:
- Change colors in gradient styles
- Add/remove sections
- Modify content and images
- Update company branding

### WhatsApp Messages
Edit `server/utils/whatsappService.js`:
- Modify message templates
- Change emojis and formatting
- Add custom URLs
- Adjust message length

## 📊 Monitoring

### Check Logs
```bash
# Watch server logs for notification status
npm run dev

# Look for:
✅ Welcome email sent successfully: <messageId>
✅ Welcome WhatsApp sent successfully: <sid>
❌ Error sending email: <error>
```

### Twilio Dashboard
- Monitor messages sent
- Check delivery status
- View error logs
- Track usage and costs

## 🔐 Security

- Never commit .env file
- Use strong JWT secrets
- Rotate API keys regularly
- Use environment variables
- Restrict Twilio webhook IPs in production

## 📞 Support

For issues with:
- **Email**: Check Gmail settings and App Password
- **WhatsApp**: Verify Twilio credentials and sandbox setup
- **General**: Check server logs and .env configuration

---

**Made with ❤️ for Gezana Digital Solutions**

