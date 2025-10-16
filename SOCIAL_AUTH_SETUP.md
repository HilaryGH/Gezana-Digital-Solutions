# Social Authentication Setup Guide

This guide will help you set up Google and Facebook OAuth authentication for your Gezana application.

## 🚀 Features Added

✅ **Google OAuth Login** - Users can sign in with their Google account
✅ **Facebook OAuth Login** - Users can sign in with their Facebook account  
✅ **Account Linking** - Existing users can link their social accounts
✅ **Automatic User Creation** - New users are created automatically from social profiles
✅ **JWT Token Generation** - Seamless integration with existing auth system
✅ **Beautiful UI** - Social login buttons with proper styling

## 📋 Prerequisites

1. **Google Cloud Console Account**
2. **Facebook Developer Account**
3. **Environment Variables Setup**

## 🔧 Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### Step 2: Configure OAuth Consent Screen
1. Go to "OAuth consent screen"
2. Choose "External" user type
3. Fill in required fields:
   - App name: "Gezana"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email`, `profile`
5. Add test users (for development)

### Step 3: Create OAuth Credentials
1. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
2. Choose "Web application"
3. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
4. Copy the Client ID and Client Secret

## 📘 Facebook OAuth Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Choose "Consumer" or "Business" type

### Step 2: Add Facebook Login
1. Add "Facebook Login" product
2. Go to Facebook Login settings
3. Add valid OAuth redirect URIs:
   - `http://localhost:5000/api/auth/facebook/callback` (development)
   - `https://yourdomain.com/api/auth/facebook/callback` (production)

### Step 3: Configure App Settings
1. Go to "Settings" → "Basic"
2. Add app domains and website URL
3. Copy App ID and App Secret

## ⚙️ Environment Configuration

Add these variables to your `.env` file:

```env
# Session Secret
SESSION_SECRET=your_session_secret_here

# Client URL
CLIENT_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## 🔄 How It Works

### Authentication Flow
1. User clicks "Continue with Google/Facebook"
2. Redirected to provider's OAuth page
3. User authorizes the application
4. Provider redirects back with authorization code
5. Server exchanges code for user profile
6. User is created/linked in database
7. JWT token is generated
8. User is redirected to dashboard

### Database Changes
- Added `googleId` and `facebookId` fields to User model
- Added `avatar` field for profile pictures
- Password is optional for social users
- Social accounts are auto-verified

## 🎨 UI Components

### LoginForm.tsx
- Added social login buttons with proper styling
- Google and Facebook logos
- Responsive design

### AuthSuccess.tsx
- Handles successful authentication
- Automatically redirects to appropriate dashboard
- Shows loading spinner

### AuthError.tsx
- Handles authentication errors
- User-friendly error messages
- Retry functionality

## 🛠️ Backend Routes

### New Endpoints
- `GET /api/auth/google` - Initiates Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/facebook` - Initiates Facebook OAuth  
- `GET /api/auth/facebook/callback` - Facebook OAuth callback

## 🔒 Security Features

- JWT tokens for stateless authentication
- Secure session management
- CORS configuration for cross-origin requests
- Environment variable protection
- Input validation and sanitization

## 🚀 Testing

### Development Testing
1. Start your server: `npm run dev`
2. Start your client: `npm run dev`
3. Go to login page
4. Click social login buttons
5. Complete OAuth flow
6. Verify user creation in database

### Production Deployment
1. Update OAuth redirect URIs in provider consoles
2. Set production environment variables
3. Deploy both frontend and backend
4. Test OAuth flow in production

## 🐛 Troubleshooting

### Common Issues

**"Invalid redirect URI"**
- Check redirect URIs in provider console
- Ensure URLs match exactly (including http/https)

**"App not verified"**
- Add test users in Google Console
- Complete Facebook app review process

**"CORS errors"**
- Check CLIENT_URL environment variable
- Verify CORS configuration in server

**"Token generation fails"**
- Check JWT_SECRET environment variable
- Verify user creation in database

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Passport.js Documentation](http://www.passportjs.org/docs/)

## 🎉 Success!

Your social authentication is now ready! Users can sign in with Google and Facebook, and the system will automatically create accounts or link existing ones.

For any issues or questions, check the troubleshooting section above or refer to the provider documentation.
