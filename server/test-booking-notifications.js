/**
 * Test Booking Confirmation Notifications
 * 
 * This script tests the booking notification system
 */

require('dotenv').config();
const { sendBookingConfirmationNotifications } = require('./utils/notificationService');

// Test booking data
const testCustomer = {
  name: 'John Doe',
  email: 'test@example.com',
  phone: '+251911234567',
  whatsapp: '+251911234567'
};

const testBookingDetails = {
  serviceName: 'Professional Home Cleaning',
  providerName: 'ABC Cleaning Services',
  date: 'Monday, October 9, 2025',
  time: '10:00 AM',
  price: 500,
  location: 'Addis Ababa, Bole'
};

async function testBookingNotifications() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 BOOKING NOTIFICATION TEST');
  console.log('='.repeat(60));
  
  console.log('\n📋 Test Data:');
  console.log('Customer:', testCustomer.name);
  console.log('Email:', testCustomer.email);
  console.log('Phone:', testCustomer.phone);
  console.log('Service:', testBookingDetails.serviceName);
  console.log('Provider:', testBookingDetails.providerName);
  console.log('Date:', testBookingDetails.date);
  console.log('Time:', testBookingDetails.time);
  console.log('Price:', testBookingDetails.price, 'ETB');
  
  console.log('\n📧 Sending booking confirmation notifications...');
  
  try {
    const results = await sendBookingConfirmationNotifications(
      testCustomer,
      testBookingDetails
    );
    
    console.log('\n📊 Results:');
    if (results.email?.success) {
      console.log('✅ EMAIL: Sent successfully!');
      console.log('   Message ID:', results.email.messageId);
    } else {
      console.log('❌ EMAIL: Failed');
      console.log('   Error:', results.email?.error);
    }
    
    if (results.whatsapp?.success) {
      console.log('✅ WHATSAPP: Sent successfully!');
      console.log('   Message ID:', results.whatsapp.messageSid);
    } else {
      console.log('⚠️  WHATSAPP:', results.whatsapp?.error || 'Not configured');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed!');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

testBookingNotifications();

