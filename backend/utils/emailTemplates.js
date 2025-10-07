const emailTemplates = {
  // Welcome Email Template
  welcome: (userName, role) => {
    const roleSpecificContent = {
      candidate: {
        title: "Welcome to Ozarx - Your Job Search Journey Begins!",
        content: `
          <p>We're excited to have you join our platform! As a job seeker, you now have access to:</p>
          <ul>
            <li>🎯 Browse thousands of job opportunities</li>
            <li>📝 Apply to jobs with one click</li>
            <li>📊 Track your application status</li>
            <li>🎓 Access career resources and tips</li>
          </ul>
        `
      },
      employer: {
        title: "Welcome to Ozarx - Start Hiring Top Talent!",
        content: `
          <p>Welcome to the future of recruitment! As an employer, you can now:</p>
          <ul>
            <li>📝 Post job openings instantly</li>
            <li>👥 Manage applications efficiently</li>
            <li>🎯 Find the perfect candidates</li>
            <li>📊 Track hiring analytics</li>
          </ul>
        `
      },
      agent: {
        title: "Welcome to Ozarx - Your Recruitment Partner!",
        content: `
          <p>Join our network of recruitment professionals! As an agent, you can:</p>
          <ul>
            <li>🤝 Connect candidates with employers</li>
            <li>💼 Manage multiple job placements</li>
            <li>📈 Track your success metrics</li>
            <li>💰 Earn commissions on successful placements</li>
          </ul>
        `
      }
    };

    const content = roleSpecificContent[role] || roleSpecificContent.candidate;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Ozarx</title>
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
            <div class="logo">🚀 Ozarx</div>
            <h1>${content.title}</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            ${content.content}
            <p>Ready to get started? Click the button below to access your dashboard:</p>
            <a href="${process.env.FRONTEND_URL || 'https://ozarx.in'}/dashboard" class="button">Access Dashboard</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Ozarx Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Ozarx. All rights reserved.</p>
            <p>This email was sent to you because you signed up for an Ozarx account.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Forgot Password Email Template
  forgotPassword: (userName, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://ozarx.in'}/reset-password?token=${resetToken}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Ozarx</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐 Ozarx</div>
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your Ozarx account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>For security, don't share this link with anyone</li>
              </ul>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
            <p>Best regards,<br>The Ozarx Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Ozarx. All rights reserved.</p>
            <p>This email was sent because a password reset was requested for your account.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Newsletter Welcome Template
  newsletterWelcome: (email) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Ozarx Newsletter</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📧 Ozarx</div>
            <h1>Welcome to Our Newsletter!</h1>
          </div>
          <div class="content">
            <h2>Thank you for subscribing!</h2>
            <p>You're now part of our community and will receive:</p>
            <ul>
              <li>🎯 Latest job opportunities</li>
              <li>💼 Career tips and advice</li>
              <li>📊 Industry insights</li>
              <li>🎉 Exclusive offers and updates</li>
            </ul>
            <p>Stay tuned for our next newsletter with exciting opportunities!</p>
            <a href="${process.env.FRONTEND_URL || 'https://ozarx.in'}" class="button">Visit Ozarx</a>
            <p>Best regards,<br>The Ozarx Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Ozarx. All rights reserved.</p>
            <p>You can unsubscribe at any time by clicking the link in our emails.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Newsletter Template
  newsletter: (title, content, unsubscribeToken) => {
    const unsubscribeUrl = `${process.env.FRONTEND_URL || 'https://ozarx.in'}/unsubscribe?token=${unsubscribeToken}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Ozarx Newsletter</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📧 Ozarx</div>
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${content}
            <p>Best regards,<br>The Ozarx Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Ozarx. All rights reserved.</p>
            <p><a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> | <a href="${process.env.FRONTEND_URL || 'https://ozarx.in'}" style="color: #666;">Visit Website</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

module.exports = emailTemplates;









