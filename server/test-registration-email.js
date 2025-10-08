/**
 * Test Registration with Email Notification
 * 
 * This script simulates a user registration and verifies that
 * the welcome email is sent successfully.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const { sendWelcomeNotifications } = require('./utils/notificationService');
const bcrypt = require('bcryptjs');

// Test user data
const testUsers = [
  {
    name: 'Test Seeker',
    email: 'testseeker@example.com',
    password: 'password123',
    role: 'seeker',
    phone: '+251911234567',
    address: 'Addis Ababa',
    seekerType: 'individual'
  },
  {
    name: 'Test Provider Company',
    email: 'testprovider@example.com',
    password: 'password123',
    role: 'provider',
    subRole: 'smallBusiness',
    serviceType: 'cleaning',
    phone: '+251922334455',
    city: 'Addis Ababa'
  }
];

async function testRegistrationWithEmail(userData) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 Testing Registration: ${userData.name}`);
  console.log('='.repeat(60));

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log('ℹ️  User already exists, deleting for fresh test...');
      await User.deleteOne({ email: userData.email });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // 3. Create user (simulating registration)
    const newUser = new User({
      ...userData,
      password: hashedPassword
    });
    
    await newUser.save();
    console.log('✅ User created successfully');
    console.log(`   - ID: ${newUser._id}`);
    console.log(`   - Name: ${newUser.name}`);
    console.log(`   - Email: ${newUser.email}`);
    console.log(`   - Role: ${newUser.role}`);

    // 4. Send welcome notifications (THIS IS WHAT HAPPENS IN REGISTRATION)
    console.log('\n📧 Sending welcome email...');
    const notificationResults = await sendWelcomeNotifications({
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      whatsapp: newUser.whatsapp
    });

    // 5. Check results
    console.log('\n📊 Notification Results:');
    if (notificationResults.email?.success) {
      console.log('   ✅ EMAIL: Sent successfully!');
      console.log(`   📨 Message ID: ${notificationResults.email.messageId}`);
      console.log(`   📬 Sent to: ${newUser.email}`);
    } else {
      console.log('   ❌ EMAIL: Failed to send');
      console.log(`   Error: ${notificationResults.email?.error}`);
    }

    if (notificationResults.whatsapp?.success) {
      console.log('   ✅ WHATSAPP: Sent successfully!');
      console.log(`   📱 Message ID: ${notificationResults.whatsapp.messageSid}`);
    } else if (notificationResults.whatsapp?.error === 'Twilio not configured') {
      console.log('   ⚠️  WHATSAPP: Not configured (optional)');
    } else {
      console.log('   ❌ WHATSAPP: Failed to send');
      console.log(`   Error: ${notificationResults.whatsapp?.error}`);
    }

    // 6. Clean up
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: userData.email });
    console.log('✅ Test user deleted');

    return {
      success: true,
      emailSent: notificationResults.email?.success || false,
      whatsappSent: notificationResults.whatsapp?.success || false
    };

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 REGISTRATION EMAIL TEST');
  console.log('='.repeat(60));
  console.log('\nThis test simulates the registration flow and verifies');
  console.log('that welcome emails are sent automatically.\n');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check environment
    console.log('📋 Environment Check:');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
    console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
    console.log('   MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Not set');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('\n❌ Email credentials not configured!');
      console.log('Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
      return;
    }

    // Test each user type
    const results = [];
    for (const userData of testUsers) {
      const result = await testRegistrationWithEmail(userData);
      results.push({ user: userData.name, ...result });
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    results.forEach(result => {
      console.log(`\n${result.user}:`);
      console.log(`   Registration: ${result.success ? '✅ Success' : '❌ Failed'}`);
      console.log(`   Email Sent: ${result.emailSent ? '✅ Yes' : '❌ No'}`);
      console.log(`   WhatsApp Sent: ${result.whatsappSent ? '✅ Yes' : '⚠️  Not configured'}`);
    });

    const allEmailsSent = results.every(r => r.emailSent);
    console.log('\n' + '='.repeat(60));
    if (allEmailsSent) {
      console.log('✅ ALL TESTS PASSED! Registration emails are working!');
    } else {
      console.log('⚠️  Some emails failed to send. Check configuration.');
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB\n');
  }
}

// Run the tests
runTests();

/*
WHAT THIS TEST DOES:
====================
1. Connects to your MongoDB database
2. Creates test users (seeker and provider)
3. Sends welcome emails (just like registration does)
4. Verifies emails were sent successfully
5. Cleans up test data

EXPECTED RESULT:
================
✅ User created successfully
✅ EMAIL: Sent successfully!
📨 Message ID: <some-id@gmail.com>
📬 Sent to: test@example.com

This proves that your registration flow will send emails!

TO RUN:
=======
node test-registration-email.js

NOTE:
=====
- Change email addresses in testUsers to send to real addresses
- Check your email inbox after running the test
- The test cleans up after itself (deletes test users)
*/
