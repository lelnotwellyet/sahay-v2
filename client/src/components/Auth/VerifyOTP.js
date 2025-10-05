import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../../services/auth';
import './styles/VerifyOTP.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const { email } = location.state || {};

  useEffect(() => {
    if (!email) {
      navigate('/');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      alert('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP({ email, otp: otpValue });
      alert('Email verified successfully!');
      
      // Save token and redirect
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (response.data.user.role === 'client') {
        navigate('/client-dashboard');
      } else {
        navigate('/counsellor-dashboard');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      // Focus first input
      document.getElementById('otp-0').focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await resendOTP({ email });
      setCountdown(60); // 60 seconds countdown
      alert('New verification code sent!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="otp-header">
          <h1>Verify Your Email</h1>
          <p>We sent a 6-digit code to {email}</p>
        </div>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((data, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleOtpChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                disabled={loading}
                className="otp-input"
              />
            ))}
          </div>

          <button 
            type="submit" 
            className={`verify-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="otp-footer">
          <p>Didn't receive the code?</p>
          <button 
            onClick={handleResendOTP}
            disabled={resendLoading || countdown > 0}
            className="resend-button"
          >
            {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;