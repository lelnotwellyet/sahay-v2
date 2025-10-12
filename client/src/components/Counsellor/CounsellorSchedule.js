import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { availabilityService } from '../../services/api';
import './styles/CounsellorSchedule.css';

const CounsellorSchedule = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState('monday');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Memoize the days array to prevent unnecessary recreations
  const days = useMemo(() => [
    { id: 'monday', name: 'Monday' },
    { id: 'tuesday', name: 'Tuesday' },
    { id: 'wednesday', name: 'Wednesday' },
    { id: 'thursday', name: 'Thursday' },
    { id: 'friday', name: 'Friday' },
    { id: 'saturday', name: 'Saturday' },
    { id: 'sunday', name: 'Sunday' }
  ], []);

  // Memoize the timeSlots array to prevent unnecessary recreations
  const timeSlots = useMemo(() => [
    { startTime: '09:00', endTime: '10:00', display: '09:00 - 10:00' },
    { startTime: '10:00', endTime: '11:00', display: '10:00 - 11:00' },
    { startTime: '11:00', endTime: '12:00', display: '11:00 - 12:00' },
    { startTime: '14:00', endTime: '15:00', display: '14:00 - 15:00' },
    { startTime: '15:00', endTime: '16:00', display: '15:00 - 16:00' },
    { startTime: '16:00', endTime: '17:00', display: '16:00 - 17:00' }
  ], []);

  // Initialize schedule state with memoized timeSlots
  const [schedule, setSchedule] = useState(() => {
    const initialSchedule = {};
    days.forEach(day => {
      initialSchedule[day.id] = timeSlots.map(slot => ({ ...slot, available: false }));
    });
    return initialSchedule;
  });

  // Load schedule from backend - properly memoized with useCallback
  const loadSchedule = useCallback(async () => {
    try {
      const response = await availabilityService.getCounsellorSchedule();
      if (response.data.success) {
        const backendSchedule = response.data.schedule;
        
        // Convert backend format to frontend format
        const newSchedule = {};
        
        days.forEach(day => {
          newSchedule[day.id] = timeSlots.map(slot => {
            // Check if this slot exists in backend schedule
            const backendSlot = backendSchedule.find(bs => 
              bs.dayOfWeek === day.id && 
              bs.startTime === slot.startTime && 
              bs.endTime === slot.endTime
            );
            
            return {
              ...slot,
              available: backendSlot ? backendSlot.isAvailable : false
            };
          });
        });
        
        setSchedule(newSchedule);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      alert('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  }, [days, timeSlots]); // Now these dependencies are memoized

  // Load schedule on component mount
  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]); // loadSchedule is now stable

  const toggleAvailability = (day, timeIndex) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map((slot, index) => 
        index === timeIndex ? { ...slot, available: !slot.available } : slot
      )
    }));
  };

  const toggleAllDay = (day, available) => {
    setSchedule(prev => ({
      ...prev,
      [day]: prev[day].map(slot => ({ ...slot, available }))
    }));
  };

  const saveSchedule = async () => {
    setSaving(true);
    try {
      // Convert frontend format to backend format
      const backendSchedule = [];
      
      days.forEach(day => {
        schedule[day.id].forEach(slot => {
          backendSchedule.push({
            dayOfWeek: day.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.available
          });
        });
      });

      await availabilityService.updateCounsellorSchedule({ 
        schedule: backendSchedule 
      });
      
      alert('Schedule saved successfully!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="counsellor-schedule">
        <div className="loading">Loading schedule...</div>
      </div>
    );
  }

  return (
    <div className="counsellor-schedule">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate('/counsellor-dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Manage Your Schedule</h1>
        <p>Set your availability for client bookings</p>
      </header>

      <div className="schedule-content">
        {/* Days Navigation */}
        <div className="days-navigation">
          {days.map(day => (
            <button
              key={day.id}
              className={`day-tab ${activeDay === day.id ? 'active' : ''}`}
              onClick={() => setActiveDay(day.id)}
            >
              {day.name}
            </button>
          ))}
        </div>

        {/* Day Schedule */}
        <div className="day-schedule">
          <div className="schedule-header">
            <h2>{days.find(d => d.id === activeDay)?.name} Schedule</h2>
            <div className="day-actions">
              <button 
                className="action-btn available"
                onClick={() => toggleAllDay(activeDay, true)}
              >
                Mark All Available
              </button>
              <button 
                className="action-btn unavailable"
                onClick={() => toggleAllDay(activeDay, false)}
              >
                Mark All Unavailable
              </button>
            </div>
          </div>

          <div className="time-slots">
            {schedule[activeDay].map((slot, index) => (
              <div key={index} className={`time-slot ${slot.available ? 'available' : 'unavailable'}`}>
                <span className="slot-time">{slot.display}</span>
                <button 
                  className={`toggle-btn ${slot.available ? 'available' : 'unavailable'}`}
                  onClick={() => toggleAvailability(activeDay, index)}
                >
                  {slot.available ? 'Available' : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="schedule-summary">
          <h3>Schedule Summary</h3>
          <div className="summary-stats">
            {days.map(day => {
              const availableSlots = schedule[day.id].filter(slot => slot.available).length;
              return (
                <div key={day.id} className="summary-item">
                  <span className="day-name">{day.name}</span>
                  <span className="slot-count">{availableSlots} slots available</span>
                </div>
              );
            })}
          </div>
          
          <button 
            className="save-schedule-btn"
            onClick={saveSchedule}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounsellorSchedule;