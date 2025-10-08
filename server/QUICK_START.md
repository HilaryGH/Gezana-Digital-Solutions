# ⚡ Quick Start - Notifications

## 🎯 5-Minute Setup

### 1️⃣ Email (2 minutes)

**Get Gmail App Password:**
```
https://myaccount.google.com/apppasswords
→ Generate password → Copy it
```

**Add to .env:**
```env
EMAIL_USER=g.fikre2@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Test:**
```bash
npm run test:email
```

### 2️⃣ WhatsApp (3 minutes) - Optional

**Setup Twilio:**
```
https://www.twilio.com/try-twilio
→ Sign up → Get sandbox → Copy credentials
```

**Add to .env:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Test:**
```bash
npm run test:whatsapp
```

---

## 🚀 What Happens Now

### ✅ On User Registration
- Beautiful welcome email sent instantly
- WhatsApp welcome message delivered
- Role-specific content (Provider/Seeker)

### ✅ On Service Creation
- Service published email confirmation
- WhatsApp notification to provider
- Instant delivery notifications

---

## 🧪 Test Commands

```bash
# Test everything
npm run test:notifications

# Email only
npm run test:email

# WhatsApp only
npm run test:whatsapp
```

---

## 📧 Preview Email

Open in browser:
```
server/email-preview.html
```

---

## 📚 Full Docs

- `README_NOTIFICATIONS.md` - Complete guide
- `NOTIFICATION_SETUP.md` - Detailed setup
- `NOTIFICATION_COMPLETE.md` - Overview

---

## 🆘 Troubleshooting

**Email not working?**
- Use App Password, not regular password
- Check spam folder
- Enable 2FA on Gmail

**WhatsApp not working?**
- Join Twilio sandbox first
- Check credentials in .env
- Verify phone format: +251911234567

---

## ✨ Features

✅ Stylish HTML email templates  
✅ Instant WhatsApp messages  
✅ Automated on registration  
✅ Service publish notifications  
✅ Non-blocking error handling  
✅ Production ready  

---

**That's it! You're ready to go! 🎉**

