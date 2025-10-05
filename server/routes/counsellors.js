const express = require('express');
const { Counsellor, User } = require('../models/user');

const router = express.Router();

// Get all verified counsellors
router.get('/', async (req, res) => {
  try {
    const counsellors = await Counsellor.find({ isVerified: true })
      .populate('userId', 'email isActive')
      .select('-verificationDocuments'); // Exclude sensitive documents

    // Format the response to match frontend expectations
    const formattedCounsellors = counsellors.map(counsellor => ({
      id: counsellor._id,
      name: counsellor.fullName,
      specialty: counsellor.specialization?.[0] || 'General Counseling',
      description: counsellor.bio || 'Professional mental health counselor',
      rating: 4.5, // You can add ratings later
      reviews: Math.floor(Math.random() * 50) + 10, // Temporary - add real reviews later
      experience: counsellor.yearsOfExperience,
      languages: ['English'], // You can add this field to your model later
      nextAvailable: 'Today', // You can add availability system later
      price: 50 + (counsellor.yearsOfExperience * 5), // Dynamic pricing based on experience
      available: counsellor.isAvailable,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(counsellor.fullName)}&background=random&size=200`
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

module.exports = router;