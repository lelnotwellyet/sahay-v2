const express = require('express');
const Session = require('../models/session');
const { Client, Counsellor } = require('../models/user');

const router = express.Router();

// Create a new session booking with availability check
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

    // Check if counsellor is available
    if (!counsellor.isAvailable) {
      return res.status(400).json({ 
        success: false, 
        message: 'Counsellor is currently not available for bookings' 
      });
    }

    // Check if time slot is already booked
    const isSlotBooked = counsellor.bookedSlots.some(slot => 
      slot.date === date && slot.startTime === time
    );

    if (isSlotBooked) {
      return res.status(400).json({ 
        success: false, 
        message: 'This time slot is already booked. Please choose another time.' 
      });
    }

    // Calculate end time (1 hour session)
    const startTime = new Date(`1970-01-01T${time}:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const endTimeString = endTime.toTimeString().slice(0, 5);

    // Create session
    const session = new Session({
      clientId: req.userId,
      counsellorId: counsellor.userId._id,
      clientName: client.realName || client.anonymousName,
      counsellorName: counsellor.fullName,
      date,
      startTime: time,
      endTime: endTimeString,
      sessionType,
      notes,
      price,
      status: 'pending',
      paymentStatus: 'completed'
    });

    await session.save();

    // Add to counsellor's booked slots
    counsellor.bookedSlots.push({
      date: date,
      startTime: time,
      endTime: endTimeString,
      sessionId: session._id
    });

    await counsellor.save();

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
// Add this route to your existing sessions.js file - place it with the other GET routes

// Get reviews for counsellor
router.get('/counsellor/reviews', async (req, res) => {
  try {
    const sessions = await Session.find({ 
      counsellorId: req.userId,
      rating: { $exists: true, $ne: null } // Only sessions with ratings
    })
    .sort({ createdAt: -1 });

    // Format the response with review data
    const reviews = sessions.map(session => ({
      id: session._id,
      clientName: session.clientName,
      date: session.date,
      time: session.startTime,
      rating: session.rating,
      review: session.review,
      sessionType: session.sessionType,
      createdAt: session.createdAt
    }));

    res.json({
      success: true,
      reviews: reviews
    });
  } catch (error) {
    console.error('Error fetching counsellor reviews:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching reviews' 
    });
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

// Reject session request - Also remove from booked slots
router.put('/:id/reject', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Remove from counsellor's booked slots
    const counsellor = await Counsellor.findOne({ userId: session.counsellorId });
    if (counsellor) {
      counsellor.bookedSlots = counsellor.bookedSlots.filter(
        slot => slot.sessionId.toString() !== session._id.toString()
      );
      await counsellor.save();
    }

    session.status = 'rejected';
    session.updatedAt = Date.now();
    await session.save();

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

// Submit rating and review for completed session
router.put('/:id/review', async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check if the logged-in user is the client of this session
    if (session.clientId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this session' });
    }

    // Check if session is completed
    if (session.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed sessions' });
    }

    // Check if rating is valid
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check if already reviewed
    if (session.rating) {
      return res.status(400).json({ success: false, message: 'Session already reviewed' });
    }

    // Update session with rating and review
    session.rating = rating;
    session.review = review || '';
    session.updatedAt = Date.now();
    
    await session.save();

    // Update counsellor's average rating and total reviews
    const counsellor = await Counsellor.findOne({ userId: session.counsellorId });
    
    if (counsellor) {
      // Calculate new average rating
      const totalRatingSum = (counsellor.averageRating * counsellor.totalReviews) + rating;
      const newTotalReviews = counsellor.totalReviews + 1;
      const newAverageRating = totalRatingSum / newTotalReviews;

      counsellor.averageRating = Math.round(newAverageRating * 10) / 10; // Round to 1 decimal
      counsellor.totalReviews = newTotalReviews;
      await counsellor.save();
    }

    res.json({
      success: true,
      message: 'Rating and review submitted successfully',
      session
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Server error while submitting review' });
  }
});

// Cancel session - Also remove from booked slots
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

    // Only allow cancellation of pending or accepted sessions
    if (!['pending', 'accepted'].includes(session.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session cannot be cancelled at this stage' 
      });
    }

    // Remove from counsellor's booked slots
    const counsellor = await Counsellor.findOne({ userId: session.counsellorId });
    if (counsellor) {
      counsellor.bookedSlots = counsellor.bookedSlots.filter(
        slot => slot.sessionId.toString() !== session._id.toString()
      );
      await counsellor.save();
    }

    // Update session status to cancelled
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
    res.status(500).json({ 
      success: false, 
      message: 'Server error while cancelling session' 
    });
  }
});


module.exports = router;