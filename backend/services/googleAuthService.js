const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verifyToken(token) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  async findOrCreateUser(googleUserInfo, role = 'candidate') {
    try {
      // Check if user exists by Google ID
      let user = await User.findOne({ googleId: googleUserInfo.googleId });
      
      if (user) {
        return user;
      }

      // Check if user exists by email (for existing users who want to link Google)
      user = await User.findOne({ email: googleUserInfo.email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleUserInfo.googleId;
        user.provider = 'google';
        user.profileImage = googleUserInfo.picture;
        user.isVerified = true; // Google emails are pre-verified
        await user.save();
        return user;
      }

      // Create new user
      user = new User({
        googleId: googleUserInfo.googleId,
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        profileImage: googleUserInfo.picture,
        provider: 'google',
        role: role,
        isVerified: true // Google emails are pre-verified
      });

      await user.save();
      return user;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  generateJWT(user) {
    return jwt.sign(
      { 
        id: user._id, 
        name: user.name, 
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
  }

  async authenticateWithGoogle(token, role = 'candidate') {
    try {
      // Verify Google token
      const googleUserInfo = await this.verifyToken(token);
      
      // Find or create user
      const user = await this.findOrCreateUser(googleUserInfo, role);
      
      // Generate JWT token
      const jwtToken = this.generateJWT(user);
      
      return {
        user,
        token: jwtToken
      };
    } catch (error) {
      console.error('Google authentication failed:', error);
      throw error;
    }
  }
}

module.exports = new GoogleAuthService();












