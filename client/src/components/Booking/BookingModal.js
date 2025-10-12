import React, { useState, useEffect, useCallback } from 'react';
import { sessionService, availabilityService } from '../../services/api';
import './styles/BookingModal.css';

const BookingModal = ({ counselor, isOpen, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState('video');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Generate next 7 days for date selection - memoized
  const getNextDays = useCallback(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  // Load available slots when date changes
  const loadAvailableSlots = useCallback(async () => {
    if (!selectedDate || !isOpen) return;
    
    setLoadingSlots(true);
    try {
      const response = await availabilityService.getAvailableSlots(counselor.id, selectedDate);
      if (response.data.success) {
        setAvailableSlots(response.data.availableSlots || []);
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, isOpen, counselor.id]);

  useEffect(() => {
    loadAvailableSlots();
  }, [loadAvailableSlots]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    // Check if the selected slot is still available
    const isSlotAvailable = availableSlots.some(slot => 
      slot.startTime === selectedTime
    );

    if (!isSlotAvailable) {
      alert('This time slot is no longer available. Please select another time.');
      await loadAvailableSlots(); // Refresh available slots
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
      const errorMessage = error.response?.data?.message || 'Failed to book session. Please try again.';
      
      if (errorMessage.includes('already booked') || errorMessage.includes('not available')) {
        // Refresh available slots if there's a conflict
        await loadAvailableSlots();
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  if (!isOpen) return null;

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
            {!counselor.available && (
              <div className="availability-warning">
                ⚠️ Currently unavailable for bookings
              </div>
            )}
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
              onChange={(e) => handleDateChange(e.target.value)}
              className="form-select"
              required
              disabled={!counselor.available}
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
            {!selectedDate ? (
              <div className="time-placeholder">
                Please select a date first
              </div>
            ) : loadingSlots ? (
              <div className="time-placeholder">
                Loading available time slots...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="time-placeholder no-slots">
                No available time slots for {getDayName(selectedDate)}
              </div>
            ) : (
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Choose a time</option>
                {availableSlots.map(slot => (
                  <option key={slot.startTime} value={slot.startTime}>
                    {slot.display || `${slot.startTime} - ${slot.endTime}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific concerns or topics you'd like to discuss..."
              className="form-textarea"
              rows="3"
              disabled={!counselor.available}
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
            <button 
              type="submit" 
              className="confirm-button" 
              disabled={loading || !counselor.available}
            >
              {loading ? 'Booking...' : counselor.available ? 'Book Session' : 'Not Available'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;