import React, { useState } from 'react';
import { sessionService } from '../../services/api';
import './styles/BookingModal.css';

const BookingModal = ({ counselor, isOpen, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('video');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Generate time slots (9 AM to 6 PM)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour}:00`);
    if (hour < 18) timeSlots.push(`${hour}:30`);
  }

  // Generate next 7 days for date selection
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        counsellorId: counselor.id,
        date: selectedDate,
        time: selectedTime,
        sessionType: sessionType,
        notes: notes,
        price: counselor.price
      };

      const response = await sessionService.book(bookingData);
      
      if (response.data.success) {
        alert('Session booked successfully! Waiting for counsellor confirmation.');
        onConfirm(response.data.session);
        onClose();
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.response?.data?.message || 'Failed to book session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="booking-modal">
        <div className="modal-header">
          <h2>Book Session with {counselor.name}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="counselor-info">
          <img src={counselor.image} alt={counselor.name} className="counselor-avatar" />
          <div className="counselor-details">
            <h3>{counselor.name}</h3>
            <p>{counselor.specialty}</p>
            <div className="price">${counselor.price}/session</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>Session Type</label>
            <div className="session-type-options">
              <label className="session-type-option">
                <input
                  type="radio"
                  value="video"
                  checked={sessionType === 'video'}
                  onChange={(e) => setSessionType(e.target.value)}
                />
                <span>🎥 Video Call</span>
              </label>
              <label className="session-type-option">
                <input
                  type="radio"
                  value="audio"
                  checked={sessionType === 'audio'}
                  onChange={(e) => setSessionType(e.target.value)}
                />
                <span>🎧 Audio Call</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Select Date</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Choose a date</option>
              {getNextDays().map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Time</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Choose a time</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific concerns or topics you'd like to discuss..."
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="booking-summary">
            <div className="summary-item">
              <span>Session Fee:</span>
              <span>${counselor.price}</span>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span>${counselor.price}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="confirm-button" disabled={loading}>
              {loading ? 'Booking...' : 'Book Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;