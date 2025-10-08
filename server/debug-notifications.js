/**
 * Debug script to check notification setup
 */

require('dotenv').config();

console.log('\n' + '='.repeat(60));
console.log('🔍 NOTIFICATION SYSTEM DEBUG');
console.log('='.repeat(60));

// Check environment variables
console.log('\n📋 Environment Variables Check:');
console.log('--------------------------------');

const envVars = {
  'EMAIL_USER': process.env.EMAIL_USER,
  'EMAIL_PASSWORD': process.env.EMAIL_PASSWORD,
  'TWILIO_ACCOUNT_SID': process.env.TWILIO_ACCOUNT_SID,
  'TWILIO_AUTH_TOKEN': process.env.TWILIO_AUTH_TOKEN,
  'TWILIO_WHATSAPP_NUMBER': process.env.TWILIO_WHATSAPP_NUMBER,
  'CLIENT_URL': process.env.CLIENT_URL,
  'MONGO_URI': process.env.MONGO_URI
};

for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    // Mask sensitive data
    if (key.includes('PASSWORD') || key.includes('TOKEN') || key.includes('SECRET')) {
      const masked = value.substring(0, 4) + '*'.repeat(Math.max(value.length - 4, 8));
      console.log(`✅ ${key}: ${masked}`);
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
}

// Check if notification files exist
console.log('\n📁 Notification Files Check:');
console.log('--------------------------------');

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  './utils/emailService.js',
  './utils/whatsappService.js',
  './utils/notificationService.js'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - EXISTS`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Test email service import
console.log('\n🔌 Service Import Check:');
console.log('--------------------------------');

try {
  const emailService = require('./utils/emailService');
  console.log('✅ emailService.js - Imported successfully');
  console.log('   Available functions:', Object.keys(emailService));
} catch (error) {
  console.log('❌ emailService.js - Import failed:', error.message);
}

try {
  const whatsappService = require('./utils/whatsappService');
  console.log('✅ whatsappService.js - Imported successfully');
  console.log('   Available functions:', Object.keys(whatsappService));
} catch (error) {
  console.log('❌ whatsappService.js - Import failed:', error.message);
}

try {
  const notificationService = require('./utils/notificationService');
  console.log('✅ notificationService.js - Imported successfully');
  console.log('   Available functions:', Object.keys(notificationService));
} catch (error) {
  console.log('❌ notificationService.js - Import failed:', error.message);
}

// Test sending a simple email
console.log('\n📧 Email Service Test:');
console.log('--------------------------------');

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  (async () => {
    try {
      const { sendWelcomeEmail } = require('./utils/emailService');
      
      console.log('Attempting to send test email...');
      const result = await sendWelcomeEmail(
        process.env.EMAIL_USER, // Send to yourself for testing
        'Test User',
        'provider'
      );
      
      if (result.success) {
        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', result.messageId);
        console.log('   Check your inbox:', process.env.EMAIL_USER);
      } else {
        console.log('❌ Test email failed:', result.error);
      }
    } catch (error) {
      console.log('❌ Email test error:', error.message);
      console.log('   Full error:', error);
    }
  })();
} else {
  console.log('⚠️  Email credentials not configured. Skipping email test.');
  console.log('   Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
}

console.log('\n' + '='.repeat(60));
console.log('💡 Tips:');
console.log('--------------------------------');
console.log('1. Make sure .env file exists in server/ directory');
console.log('2. Use Gmail App Password, not regular password');
console.log('3. Check server console logs when registering users');
console.log('4. Notifications are sent asynchronously (non-blocking)');
console.log('5. Check your spam folder for test emails');
console.log('='.repeat(60) + '\n');

