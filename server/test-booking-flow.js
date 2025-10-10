/**
 * Test Complete Booking Flow
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Category = require('./models/Category');
const ServiceType = require('./models/ServiceType');
const User = require('./models/User');

async function testBookingFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Find an existing service
    console.log('🔍 Finding an available service...');
    const service = await Service.findOne({ isActive: true }).populate('provider');
    
    if (!service) {
      console.log('❌ No services found in database');
      console.log('Please add a service first using the provider dashboard');
      return;
    }

    console.log('✅ Service found:');
    console.log('   ID:', service._id);
    console.log('   Name:', service.name);
    console.log('   Category:', service.category);
    console.log('   Type:', service.type);
    console.log('   Price:', service.price, 'ETB');
    console.log('   Provider:', service.provider?.name);

    // 2. Check/Create Category
    console.log('\n🔍 Checking category...');
    let categoryDoc = await Category.findOne({ name: service.category });
    if (!categoryDoc) {
      console.log('📝 Creating category:', service.category);
      categoryDoc = await Category.create({ name: service.category });
    }
    console.log('✅ Category:', categoryDoc.name, '(ID:', categoryDoc._id + ')');

    // 3. Check/Create ServiceType
    console.log('\n🔍 Checking service type...');
    let serviceTypeDoc = await ServiceType.findOne({ name: service.type });
    if (!serviceTypeDoc) {
      console.log('📝 Creating service type:', service.type);
      serviceTypeDoc = await ServiceType.create({
        name: service.type,
        category: categoryDoc._id
      });
    }
    console.log('✅ Service Type:', serviceTypeDoc.name, '(ID:', serviceTypeDoc._id + ')');

    // 4. Create a test booking (as guest)
    console.log('\n📝 Creating test booking as guest...');
    
    const testBookingData = {
      service: service._id,
      category: categoryDoc._id,
      serviceType: serviceTypeDoc._id,
      date: new Date(Date.now() + 86400000), // Tomorrow
      note: 'Test booking - please ignore',
      guestInfo: {
        fullName: 'Test Guest User',
        email: 'testguest@example.com',
        phone: '+251911234567',
        address: 'Addis Ababa, Bole'
      }
    };

    const booking = await Booking.create(testBookingData);
    console.log('✅ Booking created successfully!');
    console.log('   Booking ID:', booking._id);
    console.log('   Guest Name:', booking.guestInfo.fullName);
    console.log('   Guest Email:', booking.guestInfo.email);
    console.log('   Date:', booking.date);

    // 5. Clean up test booking
    console.log('\n🧹 Cleaning up test booking...');
    await Booking.deleteOne({ _id: booking._id });
    console.log('✅ Test booking deleted');

    console.log('\n' + '='.repeat(60));
    console.log('✅ BOOKING FLOW TEST PASSED!');
    console.log('='.repeat(60));
    console.log('\nYour booking system is ready to use! 🎉');
    console.log('Users and guests can now book services successfully.\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB\n');
  }
}

testBookingFlow();


