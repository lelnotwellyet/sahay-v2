import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import './styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});

  useEffect(() => {
    fetchUnverifiedCounsellors();
  }, []);

  const fetchUnverifiedCounsellors = async () => {
    try {
      const response = await adminService.getUnverifiedCounsellors();
      if (response.data.success) {
        setCounsellors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching counsellors:', error);
      alert('Failed to load unverified counsellors');
    } finally {
      setLoading(false);
    }
  };

  const verifyCounsellor = async (counsellorId) => {
    setVerifying(prev => ({ ...prev, [counsellorId]: true }));
    
    try {
      const response = await adminService.verifyCounsellor(counsellorId);
      if (response.data.success) {
        alert('Counsellor verified successfully!');
        // Remove from list
        setCounsellors(prev => prev.filter(c => c._id !== counsellorId));
      }
    } catch (error) {
      console.error('Error verifying counsellor:', error);
      alert('Failed to verify counsellor');
    } finally {
      setVerifying(prev => ({ ...prev, [counsellorId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading unverified counsellors...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard - Counsellor Verification</h1>
      
      <div className="counsellors-list">
        <h2>Unverified Counsellors ({counsellors.length})</h2>
        
        {counsellors.length === 0 ? (
          <div className="no-counsellors">
            <p>No unverified counsellors found.</p>
          </div>
        ) : (
          counsellors.map(counsellor => (
            <div key={counsellor._id} className="counsellor-card">
              <div className="counsellor-info">
                <h3>{counsellor.fullName}</h3>
                <p><strong>Email:</strong> {counsellor.userId?.email}</p>
                <p><strong>License:</strong> {counsellor.licenseNumber}</p>
                <p><strong>Specialization:</strong> {counsellor.specialization?.join(', ')}</p>
                <p><strong>Experience:</strong> {counsellor.yearsOfExperience} years</p>
                <p><strong>Qualifications:</strong> {counsellor.qualifications?.join(', ')}</p>
                {counsellor.bio && <p><strong>Bio:</strong> {counsellor.bio}</p>}
                <p><strong>Registered:</strong> {new Date(counsellor.userId?.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="actions">
                <button
                  onClick={() => verifyCounsellor(counsellor._id)}
                  disabled={verifying[counsellor._id]}
                  className="verify-btn"
                >
                  {verifying[counsellor._id] ? 'Verifying...' : 'Verify Counsellor'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;