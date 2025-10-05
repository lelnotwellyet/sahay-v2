import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/CounsellorClients.css';

const CounsellorClients = () => {
  const navigate = useNavigate();

  return (
    <div className="counsellor-clients">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate('/counsellor-dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>My Clients</h1>
        <p>Manage your client relationships and track progress</p>
      </header>

      <div className="clients-content">
        <div className="coming-soon">
          <h2>Client Management</h2>
          <p>This feature is coming soon!</p>
          <p>Manage your clients, view their progress, and access session history.</p>
          <button className="back-to-dashboard" onClick={() => navigate('/counsellor-dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounsellorClients;