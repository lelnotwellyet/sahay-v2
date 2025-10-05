import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/CounsellorSchedule.css';

const CounsellorSchedule = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState('monday');

  const days = [
    { id: 'monday', name: 'Monday' },
    { id: 'tuesday', name: 'Tuesday' },
    { id: 'wednesday', name: 'Wednesday' },
    { id: 'thursday', name: 'Thursday' },
    { id: 'friday', name: 'Friday' },
    { id: 'saturday', name: 'Saturday' },
    { id: 'sunday', name: 'Sunday' }
  ];

  const timeSlots = [
    '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', 
    '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00'
  ];

  const [schedule, setSchedule] = useState({
    monday: timeSlots.map(time => ({ time, available: true })),
    tuesday: timeSlots.map(time => ({ time, available: true })),
    wednesday: timeSlots.map(time => ({ time, available: true })),
    thursday: timeSlots.map(time => ({ time, available: true })),
    friday: timeSlots.map(time => ({ time, available: true })),
    saturday: timeSlots.map(time => ({ time, available: false })),
    sunday: timeSlots.map(time => ({ time, available: false }))
  });

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
                <span className="slot-time">{slot.time}</span>
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
        </div>
      </div>
    </div>
  );
};

export default CounsellorSchedule;