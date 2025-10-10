const express = require('express');
const Review = require('../models/review');
const { Counsellor } = require('../models/user');
const Session = require('../models/session');

const router = express.Router();

// Middleware to ensure user is authenticated (assuming you use authMiddleware in server.js)
// If you don't use it here, you'll need to define it or import it.
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

// Helper function to recalculate counselor average rating
const updateCounsellorRating = async (counsellorUserId) => {
    const result = await Review.aggregate([
        { $match: { counsellorId: counsellorUserId } },
        {
            $group: {
                _id: '$counsellorId',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 }
            }
        }
    ]);

    if (result.length > 0) {
        const { averageRating, reviewCount } = result[0];
        await Counsellor.findOneAndUpdate(
            { userId: counsellorUserId },
            { 
                rating: parseFloat(averageRating.toFixed(1)),
                reviews: reviewCount // Store the count as well
            }
        );
    }
};

// POST /api/reviews - Submit a new review (Protected by authMiddleware)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { sessionId, rating, comment } = req.body;
        const clientId = req.userId;

        // 1. Validate Session Status (must be completed)
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found.' });
        }
        if (session.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Only completed sessions can be reviewed.' });
        }
        // Ensure the client reviewing is the client who attended the session
        if (session.clientId.toString() !== clientId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to review this session.' });
        }

        // 2. Prevent Duplicate Reviews
        const existingReview = await Review.findOne({ sessionId });
        if (existingReview) {
             return res.status(400).json({ success: false, message: 'This session has already been reviewed.' });
        }
        
        // 3. Create the review
        const review = new Review({
            sessionId,
            clientId,
            counsellorId: session.counsellorId, // Use the counsellor's User ID
            rating,
            comment
        });
        await review.save();

        // 4. Update Counsellor's average rating in the Counsellor collection
        await updateCounsellorRating(session.counsellorId);

        // 5. Update the session status to indicate it has been reviewed
        await Session.findByIdAndUpdate(sessionId, { isReviewed: true });
        
        res.status(201).json({ success: true, message: 'Review submitted successfully.' });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ success: false, message: 'Server error while submitting review.' });
    }
});

// GET /api/reviews/:counsellorId - Get all reviews for a specific counsellor
router.get('/:counsellorId', async (req, res) => {
    try {
        const { counsellorId } = req.params;

        const reviews = await Review.find({ counsellorId })
            .populate('clientId', 'anonymousName') // Get the client's anonymous name
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching reviews.' });
    }
});


module.exports = router;
