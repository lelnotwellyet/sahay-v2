import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { sessionService } from '../../services/api';
import './styles/CounsellorDashboard.css';

const CounsellorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    averageRating: 4.8,
    earnings: 0
  });

  const loadSessions = async () => {
    try {
      const response = await sessionService.getCounsellorSessions();
      if (response.data.success) {
        setSessions(response.data.sessions);
        calculateStats(response.data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessions) => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const upcoming = sessions.filter(s => s.status === 'accepted').length;
    const earnings = sessions
      .filter(s => s.status === 'completed')
      .reduce((sum, session) => sum + session.price, 0);

    setSessionStats({
      totalSessions: total,
      completedSessions: completed,
      upcomingSessions: upcoming,
      averageRating: 4.8,
      earnings: earnings
    });
  };

  useEffect(() => {
    loadSessions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleManageSchedule = () => {
    navigate('/counsellor-schedule');
  };

  const handleViewClients = () => {
    navigate('/counsellor-clients');
  };

  const handleSessionNotes = () => {
    navigate('/counsellor-sessions');
  };

  const handleAcceptSession = async (sessionId) => {
    try {
      const response = await sessionService.accept(sessionId);
      if (response.data.success) {
        alert('Session accepted! Client has been notified.');
        loadSessions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error accepting session:', error);
      alert('Failed to accept session');
    }
  };

  const handleStartSession = (session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else {
      alert('No meeting link available. Please accept the session first.');
    }
  };

  const getDisplayName = () => {
    if (user?.fullName) {
      return user.fullName.split(' ')[0];
    }
    return user?.username || 'Counsellor';
  };

  const upcomingSessions = sessions.filter(session => 
    session.status === 'accepted'
  );

  const pendingRequests = sessions.filter(session => 
    session.status === 'pending'
  );

  return (
    <div className="counsellor-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>MindCare Counsellor Portal</h1>
          <p>Manage your practice and help clients</p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>Welcome, Dr. {getDisplayName()}!</span>
            <div className="user-role-badge">Counsellor</div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={activeTab === 'sessions' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('sessions')}
        >
          📅 My Sessions
        </button>
        <button 
          className={activeTab === 'clients' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('clients')}
        >
          👥 My Clients
        </button>
        <button 
          className={activeTab === 'schedule' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setActiveTab('schedule')}
        >
          ⏰ Schedule
        </button>
      </nav>

      <div className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Welcome Message with Counsellor Info */}
            <div className="welcome-card">
              <h2>Welcome back, Dr. {getDisplayName()}! 👋</h2>
              <p>Here's your practice overview for today.</p>
              {user?.specialization && (
                <div className="specialization-badge">
                  Specialization: {user.specialization}
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <h3>{sessionStats.totalSessions}</h3>
                  <p>Total Sessions</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <h3>{sessionStats.averageRating}</h3>
                  <p>Average Rating</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>${sessionStats.earnings}</h3>
                  <p>Total Earnings</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{sessionStats.completedSessions}</h3>
                  <p>Sessions Completed</p>
                </div>
              </div>
            </div>

            {/* Session Requests */}
            {pendingRequests.length > 0 && (
              <div className="session-requests-section">
                <h2>Pending Session Requests ({pendingRequests.length})</h2>
                <div className="requests-list">
                  {pendingRequests.map(session => (
                    <div key={session._id} className="request-card">
                      <div className="request-info">
                        <h4>{session.clientName}</h4>
                        <p>{session.date} at {session.time}</p>
                        <span className="session-type">{session.sessionType} Session</span>
                      </div>
                      <div className="request-actions">
                        <button 
                          className="accept-btn"
                          onClick={() => handleAcceptSession(session._id)}
                        >
                          Accept
                        </button>
                        <button className="decline-btn">
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h2>Quick Actions</h2>
              <div className="action-cards">
                <div className="action-card" onClick={handleManageSchedule}>
                  <h3>⏰ Manage Schedule</h3>
                  <p>Set your availability and working hours</p>
                </div>
                <div className="action-card" onClick={handleViewClients}>
                  <h3>👥 View Clients</h3>
                  <p>See your client list and their progress</p>
                </div>
                <div className="action-card" onClick={handleSessionNotes}>
                  <h3>📝 Session Notes</h3>
                  <p>Review and update client session notes</p>
                </div>
                <div className="action-card">
                  <h3>💳 Earnings</h3>
                  <p>View your payments and earnings history</p>
                </div>
              </div>
            </div>

            {/* Upcoming Sessions Preview */}
            <div className="upcoming-sessions-preview">
              <div className="section-header">
                <h2>Today's Sessions</h2>
                <button className="view-all-btn" onClick={() => setActiveTab('sessions')}>
                  View All
                </button>
              </div>
              {upcomingSessions.length > 0 ? (
                <div className="sessions-list">
                  {upcomingSessions.slice(0, 3).map(session => (
                    <div key={session._id} className="session-item">
                      <div className="session-info">
                        <h4>{session.clientName}</h4>
                        <p>{session.date} at {session.time}</p>
                        <span className="session-type">{session.sessionType}</span>
                      </div>
                      <div className="session-actions">
                        <button 
                          className="start-session-btn"
                          onClick={() => handleStartSession(session)}
                        >
                          Start Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-sessions">No sessions scheduled for today.</p>
              )}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="sessions-section">
            <h2>My Sessions</h2>
            {loading ? (
              <div className="loading">Loading sessions...</div>
            ) : sessions.length > 0 ? (
              <div className="sessions-list-full">
                {sessions.map(session => (
                  <div key={session._id} className="session-card-full">
                    <div className="session-header">
                      <div className="client-info">
                        <h3>{session.clientName}</h3>
                        <p>{session.date} at {session.time}</p>
                        <span className={`status-badge ${session.status}`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="session-details">
                        <p><strong>Type:</strong> {session.sessionType}</p>
                        <p><strong>Price:</strong> ${session.price}</p>
                        {session.notes && <p><strong>Notes:</strong> {session.notes}</p>}
                      </div>
                    </div>
                    <div className="session-actions">
                      {session.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn primary"
                            onClick={() => handleAcceptSession(session._id)}
                          >
                            Accept
                          </button>
                          <button className="action-btn danger">
                            Decline
                          </button>
                        </>
                      )}
                      {session.status === 'accepted' && (
                        <button 
                          className="action-btn primary"
                          onClick={() => handleStartSession(session)}
                        >
                          Start Session
                        </button>
                      )}
                      {session.status === 'completed' && (
                        <button className="action-btn secondary">
                          View Notes
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-sessions">
                <p>No sessions found.</p>
                <p>When clients book sessions, they will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="clients-section">
            <h2>My Clients</h2>
            <div className="coming-soon">
              <p>Client management system coming soon!</p>
              <p>Manage your clients, view their progress, and access session history.</p>
              <button className="cta-button" onClick={() => navigate('/counsellor-clients')}>
                Go to Clients Management
              </button>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <h2>My Schedule</h2>
            <div className="coming-soon">
              <p>Schedule management system coming soon!</p>
              <p>Set your availability, manage appointments, and view your calendar.</p>
              <button className="cta-button" onClick={() => navigate('/counsellor-schedule')}>
                Go to Schedule Management
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounsellorDashboard;