const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Link to the session that was reviewed
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    unique: true // A session can only be reviewed once
  },
  // Link to the client who wrote the review
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Link to the counsellor being reviewed
  counsellorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The star rating given by the client
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  // The text of the review
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
