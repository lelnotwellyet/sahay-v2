import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../../services/api';
import './styles/MySessions.css';

const MySessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load sessions initially
  useEffect(() => {
    loadSessions();
  }, []);

  // ✅ Auto-refresh sessions every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const hasPendingSessions = sessions.some(
        (session) => session.status === 'pending'
      );
      if (hasPendingSessions) {
        loadSessions();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [sessions]);

  const loadSessions = async () => {
    try {
      const response = await sessionService.getClientSessions();
      if (response.data.success) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      alert('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const upcomingSessions = sessions.filter(
    (session) => session.status === 'pending' || session.status === 'accepted'
  );
  const completedSessions = sessions.filter(
    (session) => session.status === 'completed'
  );
  const rejectedSessions = sessions.filter(
    (session) => session.status === 'rejected' || session.status === 'cancelled'
  );

  const handleJoinSession = (session) => {
    if (session.status !== 'accepted') {
      alert('Session not yet accepted by counsellor');
      return;
    }

    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else {
      alert('Meeting link not available. Please contact the counsellor.');
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (
      window.confirm(
        'Are you sure you want to cancel this session? This action cannot be undone.'
      )
    ) {
      try {
        const response = await sessionService.cancel(sessionId);
        if (response.data.success) {
          alert('Session cancelled successfully!');
          loadSessions(); // Refresh the list
        }
      } catch (error) {
        console.error('Error cancelling session:', error);
        alert(error.response?.data?.message || 'Failed to cancel session');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', class: 'pending' },
      accepted: { text: 'Confirmed', class: 'confirmed' },
      completed: { text: 'Completed', class: 'completed' },
      rejected: { text: 'Rejected', class: 'rejected' },
      cancelled: { text: 'Cancelled', class: 'cancelled' },
    };

    const config = statusConfig[status] || { text: status, class: 'pending' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="my-sessions">
        <div className="loading-container">
          <h2>Loading your sessions...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="my-sessions">
      <header className="page-header">
        <button
          className="back-button"
          onClick={() => navigate('/client-dashboard')}
        >
          ← Back to Dashboard
        </button>
        <h1>My Sessions</h1>
        <p>Manage your upcoming and past counseling sessions</p>
      </header>

      <div className="sessions-content">
        {/* Upcoming Sessions */}
        <section className="sessions-section">
          <h2>Upcoming Sessions ({upcomingSessions.length})</h2>
          {upcomingSessions.length > 0 ? (
            <div className="sessions-list">
              {upcomingSessions.map((session) => (
                <div key={session._id} className="session-card upcoming">
                  <div className="session-header">
                    <div className="session-info">
                      <h3>{session.counsellorName}</h3>
                      <p className="session-datetime">
                        {formatDate(session.date)} at {session.time}
                      </p>
                      <span className="session-type">
                        {session.sessionType} Session
                      </span>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="session-price">${session.price}</div>
                  </div>

                  <div className="session-actions">
                    {session.status === 'accepted' && (
                      <button
                        className="action-button primary"
                        onClick={() => handleJoinSession(session)}
                      >
                        Join Session
                      </button>
                    )}
                    <button
                      className="action-button danger"
                      onClick={() => handleCancelSession(session._id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No upcoming sessions</h3>
              <p>
                Book your first session to get started on your mental health
                journey
              </p>
              <button
                className="cta-button"
                onClick={() => navigate('/find-counselors')}
              >
                Find a Counselor
              </button>
            </div>
          )}
        </section>

        {/* Completed Sessions */}
        <section className="sessions-section">
          <h2>Session History ({completedSessions.length})</h2>
          {completedSessions.length > 0 ? (
            <div className="sessions-list">
              {completedSessions.map((session) => (
                <div key={session._id} className="session-card completed">
                  <div className="session-header">
                    <div className="session-info">
                      <h3>{session.counsellorName}</h3>
                      <p className="session-datetime">
                        {formatDate(session.date)} at {session.time}
                      </p>
                      <span className="session-type">
                        {session.sessionType} Session
                      </span>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="session-price">${session.price}</div>
                  </div>

                  <div className="session-actions">
                    <button className="action-button secondary">
                      Rate Session
                    </button>
                    <button className="action-button primary">Book Again</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No completed sessions yet</p>
            </div>
          )}
        </section>

        {/* Rejected/Cancelled Sessions */}
        {rejectedSessions.length > 0 && (
          <section className="sessions-section">
            <h2>Cancelled Sessions ({rejectedSessions.length})</h2>
            <div className="sessions-list">
              {rejectedSessions.map((session) => (
                <div key={session._id} className="session-card rejected">
                  <div className="session-header">
                    <div className="session-info">
                      <h3>{session.counsellorName}</h3>
                      <p className="session-datetime">
                        {formatDate(session.date)} at {session.time}
                      </p>
                      <span className="session-type">
                        {session.sessionType} Session
                      </span>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="session-price">${session.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MySessions;
