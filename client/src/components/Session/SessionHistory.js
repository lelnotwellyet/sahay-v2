import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../../services/api';
import ReviewModal from './ReviewModal';
import './styles/SessionHistory.css';

const SessionHistory = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    averageRating: 0,
    totalSpent: 0,
    favoriteCounselor: null
  });

  // Memoize the calculateStats function
  const calculateStats = useCallback((sessionsData) => {
    const totalSessions = sessionsData.length;
    const completedSessions = sessionsData.filter(s => s.status === 'completed').length;
    
    // Calculate average rating for rated sessions
    const ratedSessions = sessionsData.filter(s => s.rating && s.rating > 0);
    const averageRating = ratedSessions.length > 0 
      ? (ratedSessions.reduce((sum, session) => sum + session.rating, 0) / ratedSessions.length).toFixed(1)
      : 0;

    // Calculate total spent
    const totalSpent = sessionsData
      .filter(s => s.status === 'completed')
      .reduce((sum, session) => sum + session.price, 0);

    // Find favorite counselor (most sessions with)
    const counselorCount = {};
    sessionsData.forEach(session => {
      if (session.counsellorName) {
        counselorCount[session.counsellorName] = (counselorCount[session.counsellorName] || 0) + 1;
      }
    });
    
    const favoriteCounselor = Object.keys(counselorCount).length > 0 
      ? Object.keys(counselorCount).reduce((a, b) => counselorCount[a] > counselorCount[b] ? a : b)
      : null;

    setStats({
      totalSessions,
      completedSessions,
      averageRating,
      totalSpent,
      favoriteCounselor
    });
  }, []);

  // Memoize the loadSessions function
  const loadSessions = useCallback(async () => {
    try {
      const response = await sessionService.getClientSessions();
      if (response.data.success) {
        const sessionsData = response.data.sessions;
        setSessions(sessionsData);
        calculateStats(sessionsData);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      alert('Failed to load session history');
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleOpenReviewModal = (session) => {
    setSelectedSession(session);
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedSession(null);
  };

  const handleSubmitReview = async (sessionId, rating, review) => {
    try {
      const response = await sessionService.review(sessionId, { rating, review });
      if (response.data.success) {
        alert('Thank you for your review!');
        loadSessions();
        return Promise.resolve();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
      return Promise.reject(error);
    }
  };

  const handleBookAgain = (counselorName) => {
    navigate('/find-counselors', { 
      state: { prefillSearch: counselorName } 
    });
  };

  const handleDownloadSummary = (session) => {
    // For now, this is a placeholder. In a real app, this would generate a PDF
    const summary = `
      Session Summary
      ===============
      Counselor: ${session.counsellorName}
      Date: ${formatDate(session.date)}
      Time: ${session.time}
      Type: ${session.sessionType}
      Duration: 60 minutes
      Status: ${session.status}
      ${session.rating ? `Rating: ${session.rating}/5` : ''}
      ${session.review ? `Review: "${session.review}"` : ''}
      ${session.notes ? `Notes: ${session.notes}` : ''}
    `;
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-summary-${session.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Session summary downloaded!');
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'star filled' : 'star'}>
        {index < rating ? '⭐' : '☆'}
      </span>
    ));
  };

  // Filter sessions based on active filter
  const filteredSessions = sessions.filter(session => {
    switch (activeFilter) {
      case 'completed':
        return session.status === 'completed';
      case 'cancelled':
        return session.status === 'cancelled' || session.status === 'rejected';
      case 'rated':
        return session.rating && session.rating > 0;
      case 'unrated':
        return session.status === 'completed' && (!session.rating || session.rating === 0);
      default:
        return true;
    }
  });

  const canReviewSession = (session) => {
    return session.status === 'completed' && !session.rating;
  };

  const hasBeenReviewed = (session) => {
    return session.rating && session.rating > 0;
  };

  if (loading) {
    return (
      <div className="session-history">
        <div className="loading-container">
          <h2>Loading your session history...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="session-history">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate('/client-dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Session History & Analytics</h1>
        <p>Track your mental health journey and session progress</p>
      </header>

      <div className="history-content">
        {/* Statistics Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.totalSessions}</h3>
              <p>Total Sessions</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.completedSessions}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>{stats.averageRating}</h3>
              <p>Avg Rating</p>
              <small>{sessions.filter(s => s.rating).length} rated</small>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>${stats.totalSpent}</h3>
              <p>Total Invested</p>
            </div>
          </div>
          {stats.favoriteCounselor && (
            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-info">
                <h3>{stats.favoriteCounselor}</h3>
                <p>Most Visited</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Tracking */}
        <div className="progress-section">
          <h2>Your Progress Journey</h2>
          <div className="progress-timeline">
            {sessions
              .filter(s => s.status === 'completed')
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 5)
              .map((session, index) => (
                <div key={session._id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <h4>Session with {session.counsellorName}</h4>
                    <p>{formatDate(session.date)}</p>
                    {session.rating && (
                      <div className="session-rating">
                        {renderStars(session.rating)} ({session.rating}/5)
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          {sessions.filter(s => s.status === 'completed').length === 0 && (
            <div className="empty-timeline">
              <p>Your progress timeline will appear here after completed sessions</p>
            </div>
          )}
        </div>

        {/* Session Filters */}
        <div className="session-filters">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Sessions ({sessions.length})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed ({sessions.filter(s => s.status === 'completed').length})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'rated' ? 'active' : ''}`}
            onClick={() => setActiveFilter('rated')}
          >
            Rated ({sessions.filter(s => s.rating).length})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'unrated' ? 'active' : ''}`}
            onClick={() => setActiveFilter('unrated')}
          >
            Unrated ({sessions.filter(s => s.status === 'completed' && !s.rating).length})
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cancelled')}
          >
            Cancelled ({sessions.filter(s => s.status === 'cancelled' || s.status === 'rejected').length})
          </button>
        </div>

        {/* Sessions List */}
        <div className="sessions-list-section">
          <h2>Session Details</h2>
          {filteredSessions.length > 0 ? (
            <div className="sessions-grid">
              {filteredSessions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((session) => (
                <div key={session._id} className="session-card history">
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
                      
                      {/* Session Notes */}
                      {session.notes && (
                        <div className="session-notes">
                          <strong>Your Notes:</strong> {session.notes}
                        </div>
                      )}
                      
                      {/* Rating Display */}
                      {hasBeenReviewed(session) && (
                        <div className="session-rating-display">
                          <div className="rating-stars">
                            {renderStars(session.rating)}
                          </div>
                          <span className="rating-text">
                            You rated {session.rating}/5
                          </span>
                          {session.review && (
                            <p className="review-text">"{session.review}"</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="session-price">${session.price}</div>
                  </div>

                  <div className="session-actions">
                    {canReviewSession(session) && (
                      <button 
                        className="action-button success"
                        onClick={() => handleOpenReviewModal(session)}
                      >
                        ⭐ Rate Session
                      </button>
                    )}
                    {session.status === 'completed' && (
                      <button 
                        className="action-button primary"
                        onClick={() => handleDownloadSummary(session)}
                      >
                        📋 Download Summary
                      </button>
                    )}
                    <button 
                      className="action-button secondary"
                      onClick={() => handleBookAgain(session.counsellorName)}
                    >
                      🔁 Book Again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No sessions found</h3>
              <p>
                {activeFilter === 'all' 
                  ? "You haven't booked any sessions yet."
                  : `No ${activeFilter} sessions found.`
                }
              </p>
              {activeFilter === 'all' && (
                <button
                  className="cta-button"
                  onClick={() => navigate('/find-counselors')}
                >
                  Book Your First Session
                </button>
              )}
            </div>
          )}
        </div>

        {/* Goals Section - Placeholder for future feature */}
        <div className="goals-section">
          <h2>🎯 Session Goals & Progress</h2>
          <div className="coming-soon-feature">
            <p><strong>Coming Soon:</strong> Set and track your therapy goals</p>
            <ul>
              <li>📝 Define personal objectives for each session</li>
              <li>📈 Track progress towards your mental health goals</li>
              <li>🔔 Get reminders and motivational insights</li>
              <li>📊 Visual progress charts and milestones</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={handleCloseReviewModal}
        session={selectedSession}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};

export default SessionHistory;