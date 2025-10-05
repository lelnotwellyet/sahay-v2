const nodemailer = require('nodemailer');

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: {
      name: 'Sahay Mental Wellness',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: 'Verify Your Email - Sahay',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; margin: 0;">Sahay</h1>
          <p style="color: #666; margin: 5px 0;">Your Mental Wellness Assistant</p>
        </div>
        
        <h2 style="color: #333;">Welcome to Sahay!</h2>
        <p>Thank you for registering. Please verify your email address to complete your registration and start your mental wellness journey.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #667eea; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;
                    font-size: 16px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link in your browser:<br>
          <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">
            ${verificationUrl}
          </a>
        </p>
        
        <p style="color: #888; font-size: 12px;">
          This link will expire in 24 hours.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account with Sahay, please ignore this email.
        </p>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #999; font-size: 12px;">
            Sahay &copy; ${new Date().getFullYear()} - Mental Wellness Platform
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to: ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
};

module.exports = { sendVerificationEmail };