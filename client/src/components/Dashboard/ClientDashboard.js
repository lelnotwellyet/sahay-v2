import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/ClientDashboard.css';

const ClientDashboard = () => {
  const navigate = useNavigate();

  const handleFindCounselors = () => {
    navigate('/find-counselors');
  };

  const handleUpcomingSessions = () => {
    navigate('/my-sessions');
  };

  const handleSessionHistory = () => {
    navigate('/session-history');
  };

  const handleLogout = () => {
    // We'll connect this to AuthContext later
    console.log('Logging out...');
    navigate('/login');
  };

  return (
    <div className="client-dashboard">
      <header className="dashboard-header">
        <h1>MindCare Platform</h1>
        <div className="user-info">
          <span>Welcome back, User!</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            <div className="action-card" onClick={handleFindCounselors}>
              <h3>🔍 Find Counselors</h3>
              <p>Book a session with certified professionals</p>
            </div>
            <div className="action-card" onClick={handleUpcomingSessions}>
              <h3>📅 Upcoming Sessions</h3>
              <p>View your scheduled appointments</p>
            </div>
            <div className="action-card" onClick={handleSessionHistory}>
              <h3>📝 Session History</h3>
              <p>Review past counseling sessions</p>
            </div>
          </div>
        </div>
        
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-placeholder">
            <p>No recent activity. Book your first session!</p>
            <button className="cta-button" onClick={handleFindCounselors}>
              Find Your First Counselor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;