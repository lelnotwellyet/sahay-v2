const express = require('express');
const { Counsellor } = require('../models/user');
const Session = require('../models/session');

const router = express.Router();

// Auth middleware
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

// Get counselor's availability schedule
router.get('/counsellor/schedule', authMiddleware, async (req, res) => {
  try {
    const counsellor = await Counsellor.findOne({ userId: req.userId });
    
    if (!counsellor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Counsellor not found' 
      });
    }

    // If no availability is set, initialize with default empty schedule
    if (!counsellor.availability || counsellor.availability.length === 0) {
      const defaultAvailability = [
        { dayOfWeek: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: false },
        { dayOfWeek: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: false },
        { dayOfWeek: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: false },
        { dayOfWeek: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: false },
        { dayOfWeek: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: false },
        { dayOfWeek: 'saturday', startTime: '09:00', endTime: '17:00', isAvailable: false },
        { dayOfWeek: 'sunday', startTime: '09:00', endTime: '17:00', isAvailable: false }
      ];
      
      counsellor.availability = defaultAvailability;
      await counsellor.save();
    }

    res.json({
      success: true,
      schedule: counsellor.availability,
      isAvailable: counsellor.isAvailable
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching schedule' 
    });
  }
});

// Update counselor's availability schedule
router.put('/counsellor/schedule', authMiddleware, async (req, res) => {
  try {
    const { schedule, isAvailable } = req.body;

    const counsellor = await Counsellor.findOne({ userId: req.userId });
    
    if (!counsellor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Counsellor not found' 
      });
    }

    // Update schedule
    if (schedule) {
      counsellor.availability = schedule;
    }

    // Update overall availability
    if (isAvailable !== undefined) {
      counsellor.isAvailable = isAvailable;
    }

    await counsellor.save();

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      schedule: counsellor.availability,
      isAvailable: counsellor.isAvailable
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating schedule' 
    });
  }
});

// Get available time slots for a counselor on a specific date
router.get('/counsellor/:counsellorId/available-slots', async (req, res) => {
  try {
    const { counsellorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const counsellor = await Counsellor.findById(counsellorId);
    
    if (!counsellor || !counsellor.isAvailable) {
      return res.json({
        success: true,
        availableSlots: []
      });
    }

    // Get day of week from date
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Get counselor's availability for this day
    const dayAvailability = counsellor.availability.find(avail => 
      avail.dayOfWeek === dayOfWeek && avail.isAvailable
    );

    if (!dayAvailability) {
      return res.json({
        success: true,
        availableSlots: []
      });
    }

    // Generate time slots based on availability
    const availableSlots = generateTimeSlots(dayAvailability.startTime, dayAvailability.endTime);

    // Filter out booked slots
    const bookedSlots = counsellor.bookedSlots.filter(booked => 
      booked.date === date
    );

    const filteredSlots = availableSlots.filter(slot => {
      return !bookedSlots.some(booked => 
        booked.startTime === slot.startTime && booked.endTime === slot.endTime
      );
    });

    res.json({
      success: true,
      availableSlots: filteredSlots
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available slots'
    });
  }
});

// Check if a specific time slot is available
router.get('/counsellor/:counsellorId/check-slot', async (req, res) => {
  try {
    const { counsellorId } = req.params;
    const { date, startTime, endTime } = req.query;

    const counsellor = await Counsellor.findById(counsellorId);
    
    if (!counsellor || !counsellor.isAvailable) {
      return res.json({
        success: true,
        available: false
      });
    }

    // Check if slot is booked
    const isBooked = counsellor.bookedSlots.some(booked => 
      booked.date === date && 
      booked.startTime === startTime && 
      booked.endTime === endTime
    );

    res.json({
      success: true,
      available: !isBooked
    });
  } catch (error) {
    console.error('Error checking slot:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking slot availability'
    });
  }
});

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime) {
  const slots = [];
  const start = parseInt(startTime.split(':')[0]);
  const end = parseInt(endTime.split(':')[0]);
  
  for (let hour = start; hour < end; hour++) {
    slots.push({
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      display: `${hour}:00 - ${hour + 1}:00`
    });
  }
  
  return slots;
}

module.exports = router;