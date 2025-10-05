const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function testRegistration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Test user data
    const testUser = {
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      role: "seeker",
      phone: "+251912345678",
      address: "Test Address",
      whatsapp: "+251912345678",
      telegram: "@testuser",
      seekerType: "individual"
    };

    // Check if user exists
    const existingUser = await User.findOne({ email: testUser.email });
    if (existingUser) {
      console.log("❌ User already exists");
      await User.deleteOne({ email: testUser.email });
      console.log("✅ Test user deleted");
    }

    // Create test user
    const newUser = new User(testUser);
    await newUser.save();
    console.log("✅ Test user created successfully:", newUser._id);

    // Clean up
    await User.deleteOne({ email: testUser.email });
    console.log("✅ Test user cleaned up");

    console.log("✅ Registration test passed!");
  } catch (error) {
    console.error("❌ Registration test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

testRegistration();

