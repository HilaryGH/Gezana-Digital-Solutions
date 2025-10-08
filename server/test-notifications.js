/**
 * Test script for notification system
 * 
 * Make sure you have configured your .env file with:
 * - EMAIL_USER
 * - EMAIL_PASSWORD
 * - TWILIO_ACCOUNT_SID (optional for WhatsApp)
 * - TWILIO_AUTH_TOKEN (optional for WhatsApp)
 * - TWILIO_WHATSAPP_NUMBER (optional for WhatsApp)
 */

require('dotenv').config();
const { sendWelcomeEmail, sendServicePublishedEmail } = require('./utils/emailService');
const { sendWelcomeWhatsApp, sendServicePublishedWhatsApp } = require('./utils/whatsappService');
const { sendWelcomeNotifications, sendServicePublishedNotifications } = require('./utils/notificationService');

// Test data
const testUser = {
  email: 'test@example.com', // Change to your test email
  name: 'Test User',
  role: 'provider', // or 'seeker'
  phone: '+251911234567', // Change to your test phone (must join Twilio sandbox for WhatsApp)
  whatsapp: '+251911234567'
};

const testService = {
  email: 'provider@example.com', // Change to your test email
  name: 'ABC Trading',
  phone: '+251911234567',
  whatsapp: '+251911234567'
};

// Test functions
async function testEmailOnly() {
  console.log('\n📧 Testing Email Notifications...\n');
  
  console.log('1. Testing Welcome Email...');
  const welcomeResult = await sendWelcomeEmail(testUser.email, testUser.name, testUser.role);
  console.log('   Result:', welcomeResult);
  
  console.log('\n2. Testing Service Published Email...');
  const serviceResult = await sendServicePublishedEmail(testService.email, testService.name, 'Professional Cleaning Service');
  console.log('   Result:', serviceResult);
}

async function testWhatsAppOnly() {
  console.log('\n📱 Testing WhatsApp Notifications...\n');
  
  console.log('1. Testing Welcome WhatsApp...');
  const welcomeResult = await sendWelcomeWhatsApp(testUser.phone, testUser.name, testUser.role);
  console.log('   Result:', welcomeResult);
  
  console.log('\n2. Testing Service Published WhatsApp...');
  const serviceResult = await sendServicePublishedWhatsApp(testService.phone, testService.name, 'Professional Cleaning Service');
  console.log('   Result:', serviceResult);
}

async function testBothNotifications() {
  console.log('\n🎯 Testing Combined Notifications (Email + WhatsApp)...\n');
  
  console.log('1. Testing Welcome Notifications...');
  const welcomeResults = await sendWelcomeNotifications(testUser);
  console.log('   Email Result:', welcomeResults.email);
  console.log('   WhatsApp Result:', welcomeResults.whatsapp);
  
  console.log('\n2. Testing Service Published Notifications...');
  const serviceResults = await sendServicePublishedNotifications(testService, 'Professional Cleaning Service');
  console.log('   Email Result:', serviceResults.email);
  console.log('   WhatsApp Result:', serviceResults.whatsapp);
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 GEZANA NOTIFICATION SYSTEM TEST');
  console.log('='.repeat(60));
  
  // Check environment variables
  console.log('\n📋 Environment Check:');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('   TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Not set');
  console.log('   TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Not set');
  console.log('   TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER ? '✅ Set' : '❌ Not set');
  
  // Get test type from command line argument
  const testType = process.argv[2] || 'all';
  
  try {
    switch(testType) {
      case 'email':
        await testEmailOnly();
        break;
      case 'whatsapp':
        await testWhatsAppOnly();
        break;
      case 'all':
      default:
        await testBothNotifications();
        break;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Tests completed!');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run tests
runTests();

/*
Usage:
  node test-notifications.js              # Test both email and WhatsApp
  node test-notifications.js email        # Test email only
  node test-notifications.js whatsapp     # Test WhatsApp only

Note:
- Update testUser.email and testUser.phone with your test credentials
- For WhatsApp, make sure your test phone has joined the Twilio sandbox
- Check server console for detailed logs
*/

