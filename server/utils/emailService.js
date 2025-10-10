const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or any other email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Stylish HTML email template for welcome message
const getWelcomeEmailTemplate = (userName, userRole) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Gezana</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <!-- Header with gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center;">
                  <img src="https://i.ibb.co/0cXJYPP/logo.png" alt="Gezana Logo" style="width: 80px; height: 80px; margin-bottom: 20px;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Welcome to Gezana!</h1>
                  <p style="color: #fff3e0; margin: 10px 0 0 0; font-size: 16px;">Digital Solutions at Your Fingertips</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello, ${userName}! 👋</h2>
                  
                  <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin: 0 0 20px 0;">
                    Thank you for joining <strong>Gezana</strong> - Ethiopia's premier digital service marketplace! We're thrilled to have you as part of our growing community.
                  </p>
                  
                  ${userRole === 'provider' ? `
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px;">🚀 Provider Account Activated!</h3>
                      <p style="color: #78350f; margin: 0; line-height: 1.6;">
                        Your provider account is now active! You can start adding your services and connecting with customers who need your expertise.
                      </p>
                    </div>
                    
                    <h3 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 20px;">Getting Started as a Provider:</h3>
                    <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
                      <li>✅ Complete your profile with professional details</li>
                      <li>📸 Add high-quality photos of your services</li>
                      <li>💰 Set competitive pricing for your offerings</li>
                      <li>📊 Track bookings and manage your schedule</li>
                      <li>⭐ Build your reputation with customer reviews</li>
                    </ul>
                  ` : `
                    <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #1e3a8a; margin: 0 0 10px 0; font-size: 18px;">🎉 Seeker Account Created!</h3>
                      <p style="color: #1e40af; margin: 0; line-height: 1.6;">
                        Your account is ready! Start exploring our wide range of services and connect with trusted providers in your area.
                      </p>
                    </div>
                    
                    <h3 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 20px;">What You Can Do:</h3>
                    <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
                      <li>🔍 Browse hundreds of verified services</li>
                      <li>📅 Book services at your convenience</li>
                      <li>💬 Chat with providers before booking</li>
                      <li>⭐ Rate and review service providers</li>
                      <li>🎁 Earn loyalty points with every booking</li>
                    </ul>
                  `}
                  
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" 
                       style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);">
                      Get Started Now →
                    </a>
                  </div>
                  
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <h4 style="color: #1f2937; margin: 0 0 10px 0; font-size: 16px;">📱 Stay Connected:</h4>
                    <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.6;">
                      Follow us on social media for updates, tips, and exclusive offers!
                    </p>
                    <div style="margin-top: 15px;">
                      <a href="#" style="display: inline-block; margin-right: 10px; color: #3b82f6; text-decoration: none;">Facebook</a>
                      <a href="#" style="display: inline-block; margin-right: 10px; color: #ec4899; text-decoration: none;">Instagram</a>
                      <a href="#" style="display: inline-block; margin-right: 10px; color: #0891b2; text-decoration: none;">Twitter</a>
                      <a href="#" style="display: inline-block; color: #0ea5e9; text-decoration: none;">LinkedIn</a>
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #1f2937; padding: 30px; text-align: center;">
                  <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
                    Need help? Contact us at <a href="mailto:g.fikre2@gmail.com" style="color: #f97316; text-decoration: none;">g.fikre2@gmail.com</a>
                  </p>
                  <p style="color: #6b7280; margin: 0; font-size: 12px;">
                    📍 Addis Ababa, Ethiopia | 📞 +251 911 508 734
                  </p>
                  <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 12px;">
                    © ${new Date().getFullYear()} Gezana Digital Solutions. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Send welcome email
const sendWelcomeEmail = async (userEmail, userName, userRole) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Gezana Digital Solutions" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Welcome to Gezana! 🎉 Your ${userRole === 'provider' ? 'Provider' : 'Account'} is Ready`,
      html: getWelcomeEmailTemplate(userName, userRole),
      text: `Welcome to Gezana, ${userName}! Your ${userRole} account has been successfully created. Visit ${process.env.CLIENT_URL || 'http://localhost:5173'} to get started.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Service verification email template
const getVerificationEmailTemplate = (userName, providerName) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Published</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🎉 Service Published!</h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Great news, ${userName}!</h2>
                  
                  <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
                    Your service by <strong>${providerName}</strong> is now live on Gezana! Customers can now discover and book your service.
                  </p>
                  
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/services" 
                       style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
                      View Your Service
                    </a>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #1f2937; padding: 20px; text-align: center;">
                  <p style="color: #9ca3af; margin: 0; font-size: 14px;">
                    © ${new Date().getFullYear()} Gezana Digital Solutions
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// Send service published notification
const sendServicePublishedEmail = async (userEmail, userName, providerName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Gezana Digital Solutions" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎉 Your Service is Now Live on Gezana!',
      html: getVerificationEmailTemplate(userName, providerName)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Service published email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending service email:', error);
    return { success: false, error: error.message };
  }
};

// Booking confirmation email template
const getBookingConfirmationEmailTemplate = (userName, bookingDetails) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #fff 0%, #fff5f0 100%);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 30px;
      background: white;
    }
    .booking-card {
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      border-left: 4px solid #f97316;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #fed7aa;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      background: #1f2937;
      color: #9ca3af;
      padding: 20px;
      text-align: center;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
      <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 16px;">Your service has been successfully booked</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #374151;">Hi <strong>${userName}</strong>,</p>
      
      <p style="font-size: 16px; color: #374151;">
        Great news! Your booking has been confirmed. Here are your booking details:
      </p>

      <div class="booking-card">
        <h3 style="color: #ea580c; margin-top: 0;">📋 Booking Details</h3>
        <div class="detail-row">
          <span><strong>Service:</strong></span>
          <span>${bookingDetails.serviceName}</span>
        </div>
        <div class="detail-row">
          <span><strong>Provider:</strong></span>
          <span>${bookingDetails.providerName}</span>
        </div>
        <div class="detail-row">
          <span><strong>Date:</strong></span>
          <span>${bookingDetails.date}</span>
        </div>
        <div class="detail-row">
          <span><strong>Time:</strong></span>
          <span>${bookingDetails.time}</span>
        </div>
        <div class="detail-row">
          <span><strong>Location:</strong></span>
          <span>${bookingDetails.location}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span><strong>Total Amount:</strong></span>
          <span style="color: #f97316; font-size: 18px; font-weight: bold;">${bookingDetails.price} ETB</span>
        </div>
      </div>

      <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 8px;">
        <p style="margin: 0; color: #166534;">
          ✅ <strong>What's Next?</strong><br>
          • You will receive a reminder before your appointment<br>
          • The provider will contact you if needed<br>
          • You can manage your booking from your dashboard
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-bookings" class="button">
          View My Bookings
        </a>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
        If you have any questions or need to make changes, please contact us at 
        <a href="tel:+251911508734" style="color: #f97316;">+251 911 508 734</a>
      </p>

      <p style="font-size: 16px; color: #374151; margin-top: 20px;">
        Thank you for choosing Gezana!<br>
        <span style="color: #9ca3af;">The Gezana Team</span>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">
        Gezana Digital Solutions - Connecting Services, Building Trust 🤝
      </p>
      <p style="margin: 10px 0 0 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="color: #f97316;">Visit our website</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (userEmail, userName, bookingDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Gezana Digital Solutions" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎉 Booking Confirmed - Your Service is Scheduled!',
      html: getBookingConfirmationEmailTemplate(userName, bookingDetails),
      text: `Hi ${userName}, Your booking has been confirmed! Service: ${bookingDetails.serviceName}, Date: ${bookingDetails.date}, Time: ${bookingDetails.time}, Total: ${bookingDetails.price} ETB`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendServicePublishedEmail,
  sendBookingConfirmationEmail,
  createTransporter
};

