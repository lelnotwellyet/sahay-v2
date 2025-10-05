import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/SessionHistory.css';

const SessionHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="session-history">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate('/client-dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Session History</h1>
        <p>Review your past counseling sessions and progress</p>
      </header>
      
      <div className="history-content">
        <div className="coming-soon">
          <div className="feature-preview">
            <h3>📊 Session History & Analytics</h3>
            <p>This is where clients will:</p>
            <ul>
              <li>📈 Track progress over time</li>
              <li>📝 Review session notes</li>
              <li>⭐ Rate past sessions</li>
              <li>📋 Download session summaries</li>
              <li>🎯 Set and monitor goals</li>
            </ul>
            <p className="note">Feature coming in next update!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;