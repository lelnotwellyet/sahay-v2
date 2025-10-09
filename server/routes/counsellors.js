const express = require('express');
const { Counsellor, User } = require('../models/user');

const router = express.Router();

// Auth middleware for protected routes
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all verified counsellors
router.get('/', async (req, res) => {
  try {
    const counsellors = await Counsellor.find({ isVerified: true })
      .populate('userId', 'email isActive')
      .select('-verificationDocuments');

    // Format the response to use REAL rating data
    const formattedCounsellors = counsellors.map(counsellor => ({
      id: counsellor._id,
      name: counsellor.fullName,
      specialty: counsellor.specialization?.[0] || 'General Counseling',
      description: counsellor.bio || 'Professional mental health counselor',
      // USE REAL RATING DATA INSTEAD OF HARDCODED VALUES:
      averageRating: counsellor.averageRating || 0,  // Use dynamic averageRating
      totalReviews: counsellor.totalReviews || 0,    // Use dynamic totalReviews
      // Keep these for backward compatibility with existing code:
      rating: counsellor.averageRating || 0,         // Fallback for old code
      reviews: counsellor.totalReviews || 0,         // Fallback for old code
      experience: counsellor.yearsOfExperience,
      languages: counsellor.languages || ['English'],
      nextAvailable: 'Today',
      price: counsellor.price || 50,
      available: counsellor.isAvailable,
      image: counsellor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(counsellor.fullName)}&background=random&size=200`
    }));

    res.json({
      success: true,
      data: formattedCounsellors
    });
  } catch (error) {
    console.error('Error fetching counsellors:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching counsellors' 
    });
  }
});

// Get counsellor by ID
router.get('/:id', async (req, res) => {
  try {
    const counsellor = await Counsellor.findById(req.params.id)
      .populate('userId', 'email isActive');

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    res.json({
      success: true,
      data: counsellor
    });
  } catch (error) {
    console.error('Error fetching counsellor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching counsellor'
    });
  }
});

// Update counsellor availability (PROTECTED ROUTE)
router.put('/availability', authMiddleware, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const userId = req.userId;

    const counsellor = await Counsellor.findOneAndUpdate(
      { userId: userId },
      { isAvailable: isAvailable },
      { new: true }
    ).populate('userId', 'email');

    if (!counsellor) {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    res.json({
      success: true,
      message: `You are now ${isAvailable ? 'available' : 'unavailable'} for sessions`,
      data: {
        isAvailable: counsellor.isAvailable
      }
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating availability'
    });
  }
});

module.exports = router;