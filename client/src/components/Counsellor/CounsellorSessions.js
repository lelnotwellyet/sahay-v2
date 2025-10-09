import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../../services/api';
import './styles/CounsellorSessions.css';

const CounsellorSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 Component mounted - loading sessions');
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      console.log('📡 Making API call to get counsellor sessions...');
      const response = await sessionService.getCounsellorSessions();
      console.log('📦 RAW API RESPONSE:', response);
      console.log('📊 Response data:', response.data);
      
      if (response.data && response.data.success) {
        console.log('✅ API Success - Sessions:', response.data.sessions);
        setSessions(response.data.sessions || []);
        
        // SUPER DEBUG: Check each session
        if (response.data.sessions && response.data.sessions.length > 0) {
          response.data.sessions.forEach((session, index) => {
            console.log(`🔍 SESSION ${index + 1}:`, {
              id: session._id,
              clientName: session.clientName,
              status: session.status,
              statusType: typeof session.status,
              statusLength: session.status ? session.status.length : 0,
              statusCharCodes: session.status ? Array.from(session.status).map(c => c.charCodeAt(0)) : [],
              rawSession: session
            });
          });
        } else {
          console.log('❌ No sessions array in response');
        }
      } else {
        console.error('❌ API returned success: false', response.data);
      }
    } catch (error) {
      console.error('💥 ERROR loading sessions:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
    } finally {
      setLoading(false);
      console.log('🏁 Loading completed');
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      console.log('🔄 Attempting to complete session:', sessionId);
      const response = await sessionService.complete(sessionId);
      console.log('✅ Complete response:', response);
      
      if (response.data.success) {
        alert('Session marked as completed!');
        loadSessions();
      }
    } catch (error) {
      console.error('❌ Error completing session:', error);
      alert('Failed to complete session: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStartSession = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    } else {
      alert('No meeting link available.');
    }
  };

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
        <h1>My Sessions - DEBUG MODE</h1>
        <p>Total sessions: {sessions.length}</p>
        
        {/* SUPER DEBUG PANEL */}
        <div style={{
          background: '#ffebee', 
          border: '2px solid #f44336',
          borderRadius: '8px',
          padding: '15px',
          marginTop: '15px',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}>
          <strong>🔴 SUPER DEBUG PANEL</strong> 
          <div><strong>Session Count:</strong> {sessions.length}</div>
          <div><strong>Session Statuses Found:</strong> {[...new Set(sessions.map(s => s.status))].join(', ')}</div>
          <button 
            onClick={loadSessions}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 RELOAD & DEBUG
          </button>
        </div>
      </header>

      <div className="sessions-content">
        {sessions.length > 0 ? (
          <div className="sessions-list">
            {sessions.map(session => {
              // Debug the status for each session
              const status = session.status;
              const isAccepted = status === 'accepted';
              const isPending = status === 'pending';
              const isCompleted = status === 'completed';
              const isCancelled = status === 'cancelled';
              
              console.log(`🎯 Rendering session ${session._id}:`, {
                status,
                isAccepted,
                isPending,
                isCompleted,
                isCancelled
              });

              return (
                <div key={session._id} className="session-card">
                  <div className="session-header">
                    <div className="client-info">
                      <h3>{session.clientName}</h3>
                      <p className="session-date">{session.date} at {session.time}</p>
                      <div className="session-meta">
                        <span className={`status-badge ${status}`}>
                          {status} 
                          <span style={{marginLeft: '10px', fontSize: '12px', color: '#666'}}>
                            (isAccepted: {isAccepted.toString()})
                          </span>
                        </span>
                        <span className="session-type">{session.sessionType}</span>
                        <span className="session-price">${session.price}</span>
                      </div>
                      
                      {/* Session Debug Info */}
                      <div style={{
                        fontSize: '11px', 
                        color: '#666', 
                        marginTop: '8px',
                        background: '#f5f5f5',
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}>
                        <div><strong>ID:</strong> {session._id}</div>
                        <div><strong>Raw Status:</strong> "{status}" (length: {status?.length})</div>
                        <div><strong>Char Codes:</strong> {status ? Array.from(status).map(c => c.charCodeAt(0)).join(', ') : 'none'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="session-actions">
                    {/* Pending Sessions */}
                    {isPending && (
                      <div style={{padding: '10px', background: '#fff3cd', borderRadius: '4px'}}>
                        <strong>PENDING ACTIONS:</strong> Accept/Decline buttons would go here
                      </div>
                    )}
                    
                    {/* Accepted Sessions - THIS IS WHAT WE WANT TO SEE */}
                    {isAccepted && (
                      <div style={{padding: '10px', background: '#d4edda', borderRadius: '4px'}}>
                        <strong>ACCEPTED ACTIONS:</strong> 
                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                          <button 
                            className="action-btn primary"
                            onClick={() => handleStartSession(session.meetingLink)}
                          >
                            Start Session
                          </button>
                          <button 
                            className="action-btn success"
                            onClick={() => handleCompleteSession(session._id)}
                          >
                            ✅ Complete Session
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Completed Sessions */}
                    {isCompleted && (
                      <div style={{padding: '10px', background: '#e2e3e5', borderRadius: '4px'}}>
                        <strong>COMPLETED:</strong> No actions available
                      </div>
                    )}
                    
                    {/* Cancelled Sessions */}
                    {isCancelled && (
                      <div style={{padding: '10px', background: '#f8d7da', borderRadius: '4px'}}>
                        <strong>CANCELLED:</strong> No actions available
                      </div>
                    )}
                    
                    {/* Unknown Status */}
                    {!isPending && !isAccepted && !isCompleted && !isCancelled && (
                      <div style={{padding: '10px', background: '#ffebee', borderRadius: '4px', color: '#d32f2f'}}>
                        <strong>UNKNOWN STATUS:</strong> "{status}" - No actions defined for this status
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-sessions">
            <h3>No sessions found</h3>
            <p>You don't have any sessions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounsellorSessions;