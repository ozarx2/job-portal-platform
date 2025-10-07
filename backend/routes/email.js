const express = require('express');
const router = express.Router();
const EmailService = require('../services/emailService');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// GET /api/email - Get email service status
router.get('/', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Email service is available',
      endpoints: [
        'POST /api/email/forgot-password',
        'POST /api/email/send-otp',
        'POST /api/email/verify-otp',
        'POST /api/email/send-notification'
      ]
    });
  } catch (err) {
    console.error('Error checking email service:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking email service' 
    });
  }
});

// Send forgot password email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const result = await EmailService.sendForgotPasswordEmail(email);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Password reset email sent successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const result = await EmailService.resetPassword(token, newPassword);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Password reset successfully' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Subscribe to newsletter
router.post('/newsletter/subscribe', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = email || req.user.email;
    
    if (!userEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const result = await EmailService.subscribeToNewsletter(userEmail);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Successfully subscribed to newsletter' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Unsubscribe from newsletter
router.post('/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const result = await EmailService.unsubscribeFromNewsletter(email);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Successfully unsubscribed from newsletter' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Send newsletter (Admin only)
router.post('/newsletter/send', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }

    const result = await EmailService.sendNewsletter(title, content);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: result.message,
        results: result.results
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get newsletter subscribers count (Admin only)
router.get('/newsletter/subscribers', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const subscriberCount = await User.countDocuments({ 
      newsletterSubscribed: true 
    });
    
    res.json({ 
      success: true, 
      subscriberCount 
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Test email (Admin only)
router.post('/test', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { email, type } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    let result;
    switch (type) {
      case 'welcome':
        result = await EmailService.sendWelcomeEmail({ 
          name: 'Test User', 
          email, 
          role: 'candidate' 
        });
        break;
      case 'newsletter':
        result = await EmailService.sendNewsletterWelcome(email);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email type' 
        });
    }
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;









