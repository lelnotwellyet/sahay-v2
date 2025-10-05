import React from 'react';
import { Link } from 'react-router-dom';
import './styles/AuthSelection.css';

const AuthSelection = () => {
  return (
    <div className="auth-selection-container">
      <div className="auth-selection-card">
        <h1>Welcome to Sahay</h1>
        <p className="subtitle">Your mental wellness assistant</p>
        
        <div className="auth-options">
          <div className="auth-option">
            <h2>I need help</h2>
            <p>Seek confidential counselling support</p>
            <Link to="/register/client" className="auth-btn client-btn">
              Continue as Client
            </Link>
            <p className="login-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="auth-option">
            <h2>I provide help</h2>
            <p>Verified mental health professionals</p>
            <Link to="/register/counsellor" className="auth-btn counsellor-btn">
              Continue as Counsellor
            </Link>
            <p className="login-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSelection;