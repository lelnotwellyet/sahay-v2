import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles/ClientRegister.css';

const ClientRegister = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    realName: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerClient } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number - only allow digits and limit to 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: digitsOnly
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    const selectedDate = new Date(formData.dateOfBirth);

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation - exactly 10 digits
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    // Date of birth validation - must be at least 15 years old
    if (formData.dateOfBirth) {
      const age = calculateAge(selectedDate);
      
      if (selectedDate >= today) {
        newErrors.dateOfBirth = 'Date of birth cannot be today or in the future';
      } else if (age < 15) {
        newErrors.dateOfBirth = 'You must be at least 15 years old to register';
      }
      
      // Additional check: should be reasonable (not before 1900)
      const minDate = new Date('1900-01-01');
      if (selectedDate < minDate) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate age from date of birth
  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Calculate max date for date input (exactly 15 years ago from today)
const getMaxDate = () => {
  const today = new Date();
  const minAgeDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
  return minAgeDate.toISOString().split('T')[0];
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await registerClient({
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        realName: formData.realName
      });

      if (result.success) {
        alert(result.data?.message || 'Registration successful! Please check your email for verification.');
        console.log('Registration response:', result.data);
        
        // Redirect to OTP verification page
        navigate('/verify-otp', { 
          state: { 
            email: formData.email,
            message: 'Please check your email for the verification code to complete your registration.'
          }
        });
      } else {
        alert(result.error || 'Registration failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-register-container">
      <div className="client-register-card">
        <h1>Join as a Client</h1>
        <p className="subtitle">Begin your journey to mental wellness</p>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="realName">Full Name (Optional)</label>
            <input
              type="text"
              id="realName"
              name="realName"
              value={formData.realName}
              onChange={handleChange}
              placeholder="You can choose to remain anonymous"
            />
            <small>Your real name is optional. We respect your privacy.</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
            <small>Enter exactly 10 digits (no spaces or special characters)</small>
          </div>

          <div className="form-group">
  <label htmlFor="dateOfBirth">Date of Birth</label>
  <input
    type="date"
    id="dateOfBirth"
    name="dateOfBirth"
    value={formData.dateOfBirth}
    onChange={handleChange}
    className={errors.dateOfBirth ? 'error' : ''}
    max={getMaxDate()}
  />
  {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
  <small>You must be at least 15 years old to register (born on or before {getMaxDate()})</small>
</div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="login-redirect">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ClientRegister;