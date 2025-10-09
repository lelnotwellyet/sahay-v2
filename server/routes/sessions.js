const express = require('express');
const Session = require('../models/session');
const { Client, Counsellor } = require('../models/user');

const router = express.Router();

// Create a new session booking
router.post('/book', async (req, res) => {
  try {
    const { counsellorId, date, time, sessionType, notes, price } = req.body;

    // Get client info
    const client = await Client.findOne({ userId: req.userId });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Get counsellor info
    const counsellor = await Counsellor.findById(counsellorId).populate('userId');
    if (!counsellor) {
      return res.status(404).json({ success: false, message: 'Counsellor not found' });
    }

    // Create session
    const session = new Session({
      clientId: req.userId,
      counsellorId: counsellor.userId._id,
      clientName: client.realName || client.anonymousName,
      counsellorName: counsellor.fullName,
      date,
      time,
      sessionType,
      notes,
      price,
      status: 'pending',
      paymentStatus: 'completed'
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Session booked successfully! Waiting for counsellor confirmation.',
      session
    });

  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({ success: false, message: 'Server error while booking session' });
  }
});

// Get sessions for counsellor
router.get('/counsellor', async (req, res) => {
  try {
    const sessions = await Session.find({ counsellorId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching counsellor sessions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get sessions for client
router.get('/client', async (req, res) => {
  try {
    const sessions = await Session.find({ clientId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching client sessions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Accept session request
router.put('/:id/accept', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'accepted',
        meetingLink: `https://meet.jit.si/mindcare-${Date.now()}`
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({
      success: true,
      message: 'Session accepted successfully!',
      session
    });
  } catch (error) {
    console.error('Error accepting session:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject session request
router.put('/:id/reject', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({
      success: true,
      message: 'Session rejected',
      session
    });
  } catch (error) {
    console.error('Error rejecting session:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Complete session
router.put('/:id/complete', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({
      success: true,
      message: 'Session marked as completed',
      session
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Cancel session
router.put('/:id/cancel', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isClient = session.clientId.toString() === req.userId;
    const isCounsellor = session.counsellorId.toString() === req.userId;
    
    if (!isClient && !isCounsellor) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this session' });
    }

    if (!['pending', 'accepted'].includes(session.status)) {
      return res.status(400).json({ success: false, message: 'Session cannot be cancelled at this stage' });
    }

    session.status = 'cancelled';
    session.updatedAt = Date.now();
    await session.save();

    res.json({
      success: true,
      message: 'Session cancelled successfully',
      session
    });
  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(500).json({ success: false, message: 'Server error while cancelling session' });
  }
});

module.exports = router;