/**
 * Interactive script to add EMAIL_PASSWORD to .env file
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

console.log('\n' + '='.repeat(60));
console.log('📧 SETUP EMAIL PASSWORD');
console.log('='.repeat(60));

console.log('\n📋 Steps to get Gmail App Password:');
console.log('1. Go to: https://myaccount.google.com/apppasswords');
console.log('2. Enable 2-Step Verification if needed');
console.log('3. Generate App Password for "Mail" > "Other (Gezana)"');
console.log('4. Copy the 16-character password\n');

rl.question('Enter your Gmail App Password (16 characters): ', (password) => {
  const cleanPassword = password.replace(/\s/g, ''); // Remove spaces
  
  if (cleanPassword.length < 10) {
    console.log('\n❌ Error: Password seems too short. Make sure you copied the full App Password.');
    rl.close();
    return;
  }

  // Check if .env exists
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\n✅ Found existing .env file');
  } else {
    console.log('\n📝 Creating new .env file');
  }

  // Check if EMAIL_PASSWORD already exists
  if (envContent.includes('EMAIL_PASSWORD=')) {
    console.log('⚠️  EMAIL_PASSWORD already exists in .env');
    rl.question('Do you want to replace it? (yes/no): ', (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        // Replace existing
        envContent = envContent.replace(/EMAIL_PASSWORD=.*/g, `EMAIL_PASSWORD=${cleanPassword}`);
        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ EMAIL_PASSWORD updated successfully!');
        showNextSteps();
      } else {
        console.log('\n❌ Operation cancelled');
      }
      rl.close();
    });
  } else {
    // Add new EMAIL_PASSWORD
    if (!envContent.includes('EMAIL_USER=')) {
      envContent += '\n# Email Configuration\nEMAIL_USER=hilarygebremedhn28@gmail.com\n';
    }
    envContent += `EMAIL_PASSWORD=${cleanPassword}\n`;
    
    if (!envContent.includes('CLIENT_URL=')) {
      envContent += '\n# Client URL\nCLIENT_URL=http://localhost:5173\n';
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ EMAIL_PASSWORD added to .env successfully!');
    showNextSteps();
    rl.close();
  }
});

function showNextSteps() {
  console.log('\n' + '='.repeat(60));
  console.log('🎉 EMAIL PASSWORD CONFIGURED!');
  console.log('='.repeat(60));
  console.log('\n📋 Next Steps:');
  console.log('1. Restart your server (Ctrl+C then npm start)');
  console.log('2. Test notifications: npm run test:email');
  console.log('3. Or register a new user to see welcome email');
  console.log('\n💡 Debug: node debug-notifications.js');
  console.log('='.repeat(60) + '\n');
}

