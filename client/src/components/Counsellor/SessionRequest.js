import React, { useState, useEffect } from 'react';
import { sessionService } from '../../services/api';
import './styles/SessionRequest.css';

const SessionRequest = ({ onAcceptSession }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const response = await sessionService.getCounsellorSessions();
      if (response.data.success) {
        const pending = response.data.sessions.filter(session => session.status === 'pending');
        setPendingRequests(pending);
      }
    } catch (error) {
      console.error('Error loading session requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (sessionId) => {
    try {
      const response = await sessionService.accept(sessionId);
      if (response.data.success) {
        alert('Session accepted successfully!');
        setPendingRequests(prev => prev.filter(req => req._id !== sessionId));
        if (onAcceptSession) {
          onAcceptSession(response.data.session);
        }
      }
    } catch (error) {
      console.error('Error accepting session:', error);
      alert('Failed to accept session');
    }
  };

  const handleDecline = async (sessionId) => {
    try {
      const response = await sessionService.reject(sessionId);
      if (response.data.success) {
        alert('Session declined');
        setPendingRequests(prev => prev.filter(req => req._id !== sessionId));
      }
    } catch (error) {
      console.error('Error declining session:', error);
      alert('Failed to decline session');
    }
  };

  if (loading) {
    return (
      <div className="session-request-container">
        <h3>Session Requests</h3>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="session-request-container">
      <h3>Session Requests ({pendingRequests.length})</h3>
      {pendingRequests.length === 0 ? (
        <p className="no-requests">No pending session requests</p>
      ) : (
        pendingRequests.map(request => (
          <div key={request._id} className="session-request-card">
            <div className="request-header">
              <h4>New Session Request</h4>
              <span className="request-time">
                {new Date(request.createdAt).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="client-info">
              <strong>Client:</strong> {request.clientName}
            </div>
            
            <div className="session-details">
              <p><strong>Date & Time:</strong> {request.date} at {request.time}</p>
              <p><strong>Session Type:</strong> {request.sessionType}</p>
              <p><strong>Price:</strong> ${request.price}</p>
              {request.notes && (
                <p><strong>Client Notes:</strong> {request.notes}</p>
              )}
            </div>

            <div className="request-actions">
              <button 
                className="accept-btn"
                onClick={() => handleAccept(request._id)}
              >
                Accept Session
              </button>
              <button 
                className="decline-btn"
                onClick={() => handleDecline(request._id)}
              >
                Decline
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SessionRequest;