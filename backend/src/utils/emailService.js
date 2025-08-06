const nodemailer = require('nodemailer');

// Email service configuration
const emailService = {
  // Create transporter (you'll need to configure with your email provider)
  createTransporter: () => {
    // For development, use ethereal email (fake SMTP)
    if (process.env.NODE_ENV === 'development') {
      return nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    }
    
    // For production, configure with your email provider (Gmail, SendGrid, etc.)
    return nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  },

  // Send verification email
  sendVerificationEmail: async (email, name, verificationCode) => {
    try {
      const transporter = emailService.createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@auctionhub.com',
        to: email,
        subject: '🔐 Verify Your AuctionHub Account',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #de6b22, #ff8c42); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔨 AuctionHub</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Welcome to the marketplace!</p>
            </div>
            
            <div style="padding: 40px 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}! 👋</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Thanks for joining AuctionHub! To complete your registration and start bidding on amazing items, 
                please verify your email address using the code below:
              </p>
              
              <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0; border: 2px dashed #de6b22;">
                <p style="color: #666; margin-bottom: 15px; font-size: 16px;">Your verification code:</p>
                <div style="font-size: 36px; font-weight: bold; color: #de6b22; letter-spacing: 8px; font-family: monospace;">
                  ${verificationCode}
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Enter this code in the app to verify your account. The code will expire in 
                <strong>10 minutes</strong> for security.
              </p>
              
              <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #de6b22;">
                <p style="color: #de6b22; margin: 0; font-size: 14px;">
                  <strong>Security tip:</strong> Never share this code with anyone. AuctionHub will never ask for your verification code via phone or email.
                </p>
              </div>
            </div>
            
            <div style="background: #333; padding: 30px; text-align: center; color: white;">
              <p style="margin: 0; opacity: 0.8; font-size: 14px;">
                This email was sent from AuctionHub. If you didn't create an account, you can safely ignore this email.
              </p>
              <p style="margin: 15px 0 0 0; opacity: 0.6; font-size: 12px;">
                © 2024 AuctionHub - CSIS 4280 Project
              </p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log('📧 Verification email sent successfully');
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
      }
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(result) : null
      };
      
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  },

  // Send bid notification email
  sendBidNotification: async (email, name, itemName, bidAmount, isOutbid = false) => {
    try {
      const transporter = emailService.createTransporter();
      
      const subject = isOutbid ? 
        '😔 You\'ve been outbid on AuctionHub' : 
        '🎉 Bid confirmation - AuctionHub';
        
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@auctionhub.com',
        to: email,
        subject,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: ${isOutbid ? '#ff5722' : '#4caf50'}; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔨 AuctionHub</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">
                ${isOutbid ? 'Bid Update' : 'Bid Confirmation'}
              </p>
            </div>
            
            <div style="padding: 40px 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
              
              ${isOutbid ? `
                <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                  Unfortunately, you've been outbid on <strong>${itemName}</strong>. 
                  Your bid of <strong>$${bidAmount}</strong> is no longer the highest.
                </p>
                <p style="color: #666; line-height: 1.6;">
                  Don't worry! You can place a new bid to get back in the lead.
                </p>
              ` : `
                <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                  Great news! Your bid has been placed successfully.
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Item:</strong> ${itemName}</p>
                  <p style="margin: 10px 0 0 0;"><strong>Your bid:</strong> $${bidAmount}</p>
                </div>
                <p style="color: #666; line-height: 1.6;">
                  You're currently the highest bidder! We'll notify you if someone outbids you.
                </p>
              `}
            </div>
            
            <div style="background: #333; padding: 30px; text-align: center; color: white;">
              <p style="margin: 0; opacity: 0.8; font-size: 14px;">
                Happy bidding!<br>The AuctionHub Team
              </p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      
      console.log(`📧 ${isOutbid ? 'Outbid' : 'Bid confirmation'} email sent successfully`);
      
      return {
        success: true,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error('❌ Error sending bid notification:', error);
      throw new Error('Failed to send bid notification email');
    }
  },

  // Send auction ending notification
  sendAuctionEndingSoon: async (email, name, itemName, timeLeft) => {
    try {
      const transporter = emailService.createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@auctionhub.com',
        to: email,
        subject: '⏰ Auction Ending Soon - AuctionHub',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #ff9800, #f57c00); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔨 AuctionHub</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">⏰ Time is running out!</p>
            </div>
            
            <div style="padding: 40px 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                The auction for <strong>${itemName}</strong> is ending soon!
              </p>
              
              <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800; margin: 20px 0;">
                <p style="color: #ff9800; margin: 0; font-size: 18px;">
                  <strong>Time remaining: ${timeLeft}</strong>
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                Don't miss out! Place your final bid now before the auction ends.
              </p>
            </div>
            
            <div style="background: #333; padding: 30px; text-align: center; color: white;">
              <p style="margin: 0; opacity: 0.8; font-size: 14px;">
                Good luck with your bidding!<br>The AuctionHub Team
              </p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('📧 Auction ending notification sent successfully');
      
      return {
        success: true,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error('❌ Error sending auction ending notification:', error);
      throw new Error('Failed to send auction ending notification');
    }
  },

  // Send auction won notification
  sendAuctionWon: async (email, name, itemName, winningBid) => {
    try {
      const transporter = emailService.createTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@auctionhub.com',
        to: email,
        subject: '🎉 Congratulations! You won the auction - AuctionHub',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #4caf50, #8bc34a); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔨 AuctionHub</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">🎉 Congratulations!</p>
            </div>
            
            <div style="padding: 40px 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">🎊 You Won! 🎊</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Congratulations ${name}! You've won the auction for <strong>${itemName}</strong>.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #4caf50;">
                <p style="margin: 0;"><strong>Item:</strong> ${itemName}</p>
                <p style="margin: 10px 0 0 0;"><strong>Winning bid:</strong> $${winningBid}</p>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                The seller will be in touch with you soon to arrange payment and delivery details.
              </p>
            </div>
            
            <div style="background: #333; padding: 30px; text-align: center; color: white;">
              <p style="margin: 0; opacity: 0.8; font-size: 14px;">
                Enjoy your new item!<br>The AuctionHub Team
              </p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('📧 Auction won notification sent successfully');
      
      return {
        success: true,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error('❌ Error sending auction won notification:', error);
      throw new Error('Failed to send auction won notification');
    }
  },

  // Send password reset email
  sendPasswordReset: async (email, name, resetToken) => {
    try {
      const transporter = emailService.createTransporter();
      
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@auctionhub.com',
        to: email,
        subject: '🔐 Reset Your AuctionHub Password',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #de6b22, #ff8c42); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔨 AuctionHub</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
            </div>
            
            <div style="padding: 40px 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #de6b22; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <code style="background: #f0f0f0; padding: 5px; border-radius: 3px; word-break: break-all;">${resetUrl}</code>
              </p>
              
              <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #de6b22; margin-top: 30px;">
                <p style="color: #de6b22; margin: 0; font-size: 14px;">
                  <strong>Security note:</strong> This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                </p>
              </div>
            </div>
            
            <div style="background: #333; padding: 30px; text-align: center; color: white;">
              <p style="margin: 0; opacity: 0.8; font-size: 14px;">
                Need help? Contact our support team.<br>The AuctionHub Team
              </p>
            </div>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('📧 Password reset email sent successfully');
      
      return {
        success: true,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
};

module.exports = emailService;