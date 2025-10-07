const sendEmail = require('../utils/email');
const emailTemplates = require('../utils/emailTemplates');
const crypto = require('crypto');
const User = require('../models/User');

class EmailService {
  // Send welcome email to new users
  static async sendWelcomeEmail(user) {
    try {
      const { name, email, role } = user;
      const html = emailTemplates.welcome(name, role);
      
      await sendEmail({
        to: email,
        subject: `Welcome to Ozarx - Your ${role.charAt(0).toUpperCase() + role.slice(1)} Journey Begins!`,
        text: `Welcome to Ozarx! We're excited to have you join our platform.`,
        html: html
      });
      
      console.log(`Welcome email sent to ${email}`);
      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  // Send forgot password email
  static async sendForgotPasswordEmail(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour

      // Save reset token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiry = resetTokenExpiry;
      await user.save();

      const html = emailTemplates.forgotPassword(user.name, resetToken);
      
      await sendEmail({
        to: email,
        subject: 'Reset Your Password - Ozarx',
        text: 'Click the link to reset your password',
        html: html
      });
      
      console.log(`Password reset email sent to ${email}`);
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Error sending forgot password email:', error);
      throw error;
    }
  }

  // Verify reset token
  static async verifyResetToken(token) {
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiry: { $gt: Date.now() }
      });

      if (!user) {
        return { success: false, message: 'Invalid or expired token' };
      }

      return { success: true, user };
    } catch (error) {
      console.error('Error verifying reset token:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    try {
      const result = await this.verifyResetToken(token);
      if (!result.success) {
        return result;
      }

      const user = result.user;
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Send newsletter welcome email
  static async sendNewsletterWelcome(email) {
    try {
      const html = emailTemplates.newsletterWelcome(email);
      
      await sendEmail({
        to: email,
        subject: 'Welcome to Ozarx Newsletter!',
        text: 'Thank you for subscribing to our newsletter!',
        html: html
      });
      
      console.log(`Newsletter welcome email sent to ${email}`);
      return { success: true, message: 'Newsletter welcome email sent successfully' };
    } catch (error) {
      console.error('Error sending newsletter welcome email:', error);
      throw error;
    }
  }

  // Send newsletter to all subscribers
  static async sendNewsletter(title, content) {
    try {
      const subscribers = await User.find({ 
        newsletterSubscribed: true,
        email: { $exists: true, $ne: null }
      });

      if (subscribers.length === 0) {
        return { success: false, message: 'No subscribers found' };
      }

      const results = [];
      for (const subscriber of subscribers) {
        try {
          const unsubscribeToken = crypto.randomBytes(32).toString('hex');
          const html = emailTemplates.newsletter(title, content, unsubscribeToken);
          
          await sendEmail({
            to: subscriber.email,
            subject: `${title} - Ozarx Newsletter`,
            text: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            html: html
          });
          
          results.push({ email: subscriber.email, success: true });
        } catch (error) {
          console.error(`Error sending newsletter to ${subscriber.email}:`, error);
          results.push({ email: subscriber.email, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      return {
        success: true,
        message: `Newsletter sent to ${successCount} subscribers${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        results
      };
    } catch (error) {
      console.error('Error sending newsletter:', error);
      throw error;
    }
  }

  // Subscribe to newsletter
  static async subscribeToNewsletter(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.newsletterSubscribed) {
        return { success: false, message: 'Already subscribed to newsletter' };
      }

      user.newsletterSubscribed = true;
      await user.save();

      // Send welcome email
      await this.sendNewsletterWelcome(email);

      return { success: true, message: 'Successfully subscribed to newsletter' };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }

  // Unsubscribe from newsletter
  static async unsubscribeFromNewsletter(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (!user.newsletterSubscribed) {
        return { success: false, message: 'Not subscribed to newsletter' };
      }

      user.newsletterSubscribed = false;
      await user.save();

      return { success: true, message: 'Successfully unsubscribed from newsletter' };
    } catch (error) {
      console.error('Error unsubscribing from newsletter:', error);
      throw error;
    }
  }

  // Send application status update email
  static async sendApplicationStatusUpdate(application, status) {
    try {
      const user = await User.findById(application.candidate);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      const statusMessages = {
        'Shortlisted': 'Congratulations! Your application has been shortlisted.',
        'Selected': 'Great news! You have been selected for the next round.',
        'Hired': 'Congratulations! You have been hired for this position.',
        'Rejected': 'Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.'
      };

      const message = statusMessages[status] || 'Your application status has been updated.';
      const subject = `Application Update - ${application.job?.title || 'Job Application'}`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Status Update</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📧 Ozarx</div>
              <h1>Application Status Update</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>${message}</p>
              <p><strong>Job:</strong> ${application.job?.title || 'N/A'}</p>
              <p><strong>Company:</strong> ${application.job?.company || 'N/A'}</p>
              <p><strong>Status:</strong> ${status}</p>
              <a href="${process.env.FRONTEND_URL || 'https://ozarx.in'}/candidate-dashboard" class="button">View Dashboard</a>
              <p>Best regards,<br>The Ozarx Team</p>
            </div>
            <div class="footer">
              <p>© 2024 Ozarx. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: user.email,
        subject: subject,
        text: message,
        html: html
      });

      console.log(`Application status update email sent to ${user.email}`);
      return { success: true, message: 'Application status update email sent successfully' };
    } catch (error) {
      console.error('Error sending application status update email:', error);
      throw error;
    }
  }
}

module.exports = EmailService;









