const express = require('express');
const { Counsellor, User } = require('../models/user');

const router = express.Router();

// Admin middleware (check if user is admin)
const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Get all unverified counsellors
router.get('/counsellors/unverified', adminMiddleware, async (req, res) => {
  try {
    const counsellors = await Counsellor.find({ isVerified: false })
      .populate('userId', 'email createdAt')
      .select('-verificationDocuments');

    res.json({
      success: true,
      data: counsellors
    });
  } catch (error) {
    console.error('Error fetching unverified counsellors:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching counsellors' 
    });
  }
});

// Verify a counsellor
router.put('/counsellors/:id/verify', adminMiddleware, async (req, res) => {
  try {
    const counsellor = await Counsellor.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, isAvailable: true },
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
      message: 'Counsellor verified successfully',
      data: counsellor
    });
  } catch (error) {
    console.error('Error verifying counsellor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying counsellor'
    });
  }
});

module.exports = router;