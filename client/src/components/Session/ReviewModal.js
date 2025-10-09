import React, { useState } from 'react';
import './styles/ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, session, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(session._id, rating, review);
      setRating(0);
      setReview('');
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    onClose();
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        disabled={isSubmitting}
      >
        <span className="star-icon">⭐</span>
      </button>
    ));
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rate Your Session</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="session-info">
            <h3>Session with {session.counsellorName}</h3>
            <p className="session-date">
              {session.date} at {session.time}
            </p>
          </div>

          <div className="rating-section">
            <label>How would you rate your experience?</label>
            <div className="stars-container">
              {renderStars()}
            </div>
            <div className="rating-labels">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="review-section">
            <label htmlFor="review-text">Share your experience (optional)</label>
            <textarea
              id="review-text"
              placeholder="How was your session? What did you like? Any suggestions for improvement?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              disabled={isSubmitting}
              rows="4"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="cancel-btn" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;