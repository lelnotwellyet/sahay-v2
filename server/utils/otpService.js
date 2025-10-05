const nodemailer = require('nodemailer');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP Email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: {
      name: 'Sahay Mental Wellness',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: 'Your Sahay Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; margin: 0;">Sahay</h1>
          <p style="color: #666; margin: 5px 0;">Your Mental Wellness Assistant</p>
        </div>
        
        <h2 style="color: #333;">Email Verification</h2>
        <p>Use the following OTP to verify your email address and complete your registration:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); 
                     color: white; padding: 20px; border-radius: 10px; 
                     font-size: 32px; font-weight: bold; letter-spacing: 8px;
                     display: inline-block;">
            ${otp}
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          This OTP will expire in 10 minutes.
        </p>
        
        <p style="color: #888; font-size: 12px;">
          If you didn't request this code, please ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="text-align: center;">
          <p style="color: #999; font-size: 12px;">
            Sahay &copy; ${new Date().getFullYear()} - Mental Wellness Platform
          </p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to: ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
};

module.exports = { generateOTP, sendOTPEmail };