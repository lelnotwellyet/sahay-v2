const express = require('express');
const jwt = require('jsonwebtoken');
const { User, Client, Counsellor } = require('../models/user');
const { generateOTP, sendOTPEmail } = require('../utils/otpService');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '7d'
  });
};

// Client Registration with OTP
router.post('/register/client', async (req, res) => {
  try {
    const { email, password, phone, dateOfBirth, realName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = new User({
      email,
      password,
      role: 'client',
      otp,
      otpExpires
    });

    await user.save();

    // Create client profile
    const client = new Client({
      userId: user._id,
      phone,
      dateOfBirth,
      realName: realName || ''
    });

    await client.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    res.status(201).json({
      message: emailSent 
        ? 'Registration successful! Please check your email for the verification code.' 
        : 'Registration successful! But failed to send verification email.',
      userId: user._id,
      email: user.email,
      needsVerification: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Counsellor Registration with OTP
router.post('/register/counsellor', async (req, res) => {
  try {
    const { email, password, fullName, licenseNumber, specialization, yearsOfExperience, qualifications, bio } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = new User({
      email,
      password,
      role: 'counsellor',
      otp,
      otpExpires
    });

    await user.save();

    const counsellor = new Counsellor({
      userId: user._id,
      fullName,
      licenseNumber,
      specialization: Array.isArray(specialization) ? specialization : [specialization],
      yearsOfExperience,
      qualifications: Array.isArray(qualifications) ? qualifications : [qualifications],
      bio
    });

    await counsellor.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    res.status(201).json({
      message: emailSent 
        ? 'Registration successful! Please check your email for the verification code and wait for admin verification.' 
        : 'Registration successful! But failed to send verification email. Waiting for admin verification.',
      userId: user._id,
      email: user.email,
      needsVerification: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate token after successful verification
    const token = generateToken(user._id, user.role);

    let userProfile;
    if (user.role === 'client') {
      userProfile = await Client.findOne({ userId: user._id });
    } else if (user.role === 'counsellor') {
      userProfile = await Counsellor.findOne({ userId: user._id });
    }

    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        ...(user.role === 'client' && { anonymousName: userProfile?.anonymousName }),
        ...(user.role === 'counsellor' && { 
          fullName: userProfile?.fullName,
          isVerified: userProfile?.isVerified 
        })
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    res.json({
      message: emailSent 
        ? 'Verification code sent successfully' 
        : 'Failed to send verification code'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during resending OTP' });
  }
});

// Login (requires email verification)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email before logging in',
        needsVerification: true 
      });
    }

    let userProfile;
    if (user.role === 'client') {
      userProfile = await Client.findOne({ userId: user._id });
    } else if (user.role === 'counsellor') {
      userProfile = await Counsellor.findOne({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        ...(user.role === 'client' && { anonymousName: userProfile?.anonymousName }),
        ...(user.role === 'counsellor' && { 
          fullName: userProfile?.fullName,
          isVerified: userProfile?.isVerified 
        })
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;