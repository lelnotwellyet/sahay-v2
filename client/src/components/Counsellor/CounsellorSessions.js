import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../../services/api';
import './styles/CounsellorSessions.css';

const CounsellorSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await sessionService.getCounsellorSessions();
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

  const handleAcceptSession = async (sessionId) => {
    try {
      const response = await sessionService.accept(sessionId);
      if (response.data.success) {
        alert('Session accepted successfully!');
        loadSessions();
      }
    } catch (error) {
      console.error('Error accepting session:', error);
      alert('Failed to accept session');
    }
  };

  const handleRejectSession = async (sessionId) => {
    try {
      const response = await sessionService.reject(sessionId);
      if (response.data.success) {
        alert('Session rejected');
        loadSessions();
      }
    } catch (error) {
      console.error('Error rejecting session:', error);
      alert('Failed to reject session');
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this session? The client will be notified.')) {
      try {
        const response = await sessionService.cancel(sessionId);
        if (response.data.success) {
          alert('Session cancelled successfully!');
          loadSessions();
        }
      } catch (error) {
        console.error('Error cancelling session:', error);
        alert(error.response?.data?.message || 'Failed to cancel session');
      }
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      const response = await sessionService.complete(sessionId);
      if (response.data.success) {
        alert('Session marked as completed');
        loadSessions();
      }
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Failed to complete session');
    }
  };

  const handleStartSession = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else {
      alert('No meeting link available. Please accept the session first.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', class: 'pending' },
      accepted: { text: 'Confirmed', class: 'confirmed' },
      completed: { text: 'Completed', class: 'completed' },
      rejected: { text: 'Rejected', class: 'cancelled' },
      cancelled: { text: 'Cancelled', class: 'cancelled' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'pending' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const filteredSessions = sessions.filter(session => {
    if (activeFilter === 'all') return true;
    return session.status === activeFilter;
  });

  if (loading) {
    return (
      <div className="counsellor-sessions">
        <div className="loading-container">
          <h2>Loading sessions...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="counsellor-sessions">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate('/counsellor-dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Session Management</h1>
        <p>Manage and conduct your counseling sessions</p>
      </header>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={activeFilter === 'all' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setActiveFilter('all')}
        >
          All Sessions ({sessions.length})
        </button>
        <button 
          className={activeFilter === 'pending' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setActiveFilter('pending')}
        >
          Pending ({sessions.filter(s => s.status === 'pending').length})
        </button>
        <button 
          className={activeFilter === 'accepted' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setActiveFilter('accepted')}
        >
          Confirmed ({sessions.filter(s => s.status === 'accepted').length})
        </button>
        <button 
          className={activeFilter === 'completed' ? 'filter-tab active' : 'filter-tab'}
          onClick={() => setActiveFilter('completed')}
        >
          Completed ({sessions.filter(s => s.status === 'completed').length})
        </button>
      </div>

      <div className="sessions-content">
        {filteredSessions.length > 0 ? (
          <div className="sessions-list">
            {filteredSessions.map(session => (
              <div key={session._id} className="session-card">
                <div className="session-header">
                  <div className="client-info">
                    <h3>{session.clientName}</h3>
                    <p className="session-datetime">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {session.time}
                    </p>
                    <div className="session-meta">
                      <span className="session-type">{session.sessionType} Session</span>
                      {getStatusBadge(session.status)}
                      <span className="session-price">${session.price}</span>
                    </div>
                  </div>
                </div>

                {session.notes && (
                  <div className="session-notes">
                    <strong>Client Notes:</strong> {session.notes}
                  </div>
                )}

                <div className="session-actions">
                  {session.status === 'pending' && (
                    <>
                      <button 
                        className="action-btn primary"
                        onClick={() => handleAcceptSession(session._id)}
                      >
                        Accept Session
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => handleRejectSession(session._id)}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  
                  {session.status === 'accepted' && (
                    <>
                      <button 
                        className="action-btn primary"
                        onClick={() => handleStartSession(session)}
                      >
                        Start Session
                      </button>
                      <button 
                        className="action-btn success"
                        onClick={() => handleCompleteSession(session._id)}
                      >
                        Mark Complete
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => handleCancelSession(session._id)}
                      >
                        Cancel Session
                      </button>
                    </>
                  )}
                  
                  {session.status === 'completed' && (
                    <div className="completed-actions">
                      <button className="action-btn secondary">
                        View Session Notes
                      </button>
                      <button className="action-btn secondary">
                        Add Follow-up
                      </button>
                    </div>
                  )}
                </div>

                {session.meetingLink && session.status === 'accepted' && (
                  <div className="meeting-link">
                    <strong>Meeting Link:</strong> 
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                      {session.meetingLink}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-sessions">
            <h3>No sessions found</h3>
            <p>
              {activeFilter === 'all' 
                ? "You don't have any sessions yet. When clients book sessions, they will appear here."
                : `No ${activeFilter} sessions found.`
              }
            </p>
            {activeFilter !== 'all' && (
              <button 
                className="cta-button"
                onClick={() => setActiveFilter('all')}
              >
                View All Sessions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CounsellorSessions;