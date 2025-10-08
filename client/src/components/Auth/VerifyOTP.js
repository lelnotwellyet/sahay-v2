import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles/VerifyOTP.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  const { email, message } = location.state || {};

  // Redirect if no email in state
  React.useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtp({ email, otp });

      if (result.success) {
        alert('Email verified successfully! You are now logged in.');
        
        // Redirect based on user role
        const user = result.user;
        if (user.role === 'client') {
          navigate('/client-dashboard');
        } else if (user.role === 'counsellor') {
          navigate('/counsellor-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(result.error || 'OTP verification failed. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const result = await resendOtp(email);

      if (result.success) {
        alert(result.data?.message || 'Verification code sent successfully!');
      } else {
        alert(result.error || 'Failed to resend verification code.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      alert('Failed to resend verification code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="verify-otp-container">
        <div className="verify-otp-card">
          <h2>Invalid Access</h2>
          <p>Please complete registration first.</p>
          <button onClick={() => navigate('/register')} className="submit-btn">
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card">
        <h1>Verify Your Email</h1>
        <p className="subtitle">
          {message || 'Enter the 6-digit verification code sent to your email'}
        </p>
        <p className="email-display">Sent to: <strong>{email}</strong></p>
        
        <form onSubmit={handleVerify} className="verify-form">
          <div className="form-group">
            <label htmlFor="otp">Verification Code</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="\d{6}"
              required
            />
            <small>Enter the 6-digit code from your email</small>
          </div>

          <button 
            type="submit" 
            className="submit-btn verify-btn"
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button 
            onClick={handleResendOTP}
            disabled={resendLoading}
            className="resend-btn"
          >
            {resendLoading ? 'Sending...' : 'Resend Verification Code'}
          </button>
        </div>

        <p className="support-text">
          If you're having trouble receiving the email, please check your spam folder 
          or contact support.
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;