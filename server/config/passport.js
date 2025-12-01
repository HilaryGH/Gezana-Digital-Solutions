const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Determine callback URL based on environment
  // The callback URL must be the BACKEND URL where Google will redirect
  const getCallbackURL = () => {
    if (process.env.NODE_ENV === 'production') {
      // In production, always use the backend URL
      return 'https://gezana-api.onrender.com/api/auth/google/callback';
    }
    // In development, use localhost backend
    return process.env.SERVER_URL 
      ? `${process.env.SERVER_URL}/api/auth/google/callback`
      : 'http://localhost:5000/api/auth/google/callback';
  };

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: getCallbackURL(),
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.avatar = profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
          isVerified: true, // Social accounts are pre-verified
        });

        await user.save();
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);
} else {
  console.log("⚠️  Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  // Determine callback URL based on environment
  // The callback URL must be the BACKEND URL where Facebook will redirect
  const getFacebookCallbackURL = () => {
    if (process.env.NODE_ENV === 'production') {
      // In production, always use the backend URL
      return 'https://gezana-api.onrender.com/api/auth/facebook/callback';
    }
    // In development, use localhost backend
    return process.env.SERVER_URL 
      ? `${process.env.SERVER_URL}/api/auth/facebook/callback`
      : 'http://localhost:5000/api/auth/facebook/callback';
  };

  passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: getFacebookCallbackURL(),
      profileFields: ["id", "emails", "name", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with Facebook ID
        let user = await User.findOne({ facebookId: profile.id });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        if (profile.emails && profile.emails.length > 0) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Facebook account to existing user
            user.facebookId = profile.id;
            user.avatar = profile.photos[0]?.value;
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        const email = profile.emails ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error("No email provided by Facebook"), null);
        }

        user = new User({
          name: `${profile.name.givenName} ${profile.name.familyName}`,
          email: email,
          facebookId: profile.id,
          avatar: profile.photos[0]?.value,
          isVerified: true, // Social accounts are pre-verified
        });

        await user.save();
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);
} else {
  console.log("⚠️  Facebook OAuth not configured - missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET");
}

module.exports = passport;
