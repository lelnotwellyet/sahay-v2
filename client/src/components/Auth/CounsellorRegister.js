import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles/CounsellorRegister.css';

const CounsellorRegister = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    qualifications: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerCounsellor } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for years of experience - only allow positive numbers
    if (name === 'yearsOfExperience') {
      const positiveNumber = value === '' ? '' : Math.max(0, parseInt(value) || 0);
      setFormData({
        ...formData,
        [name]: positiveNumber
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

    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // License number validation
    if (!formData.licenseNumber) {
      newErrors.licenseNumber = 'License number is required';
    } else if (formData.licenseNumber.trim().length < 3) {
      newErrors.licenseNumber = 'License number must be at least 3 characters';
    }

    // Specialization validation
    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    } else if (formData.specialization.trim().length < 3) {
      newErrors.specialization = 'Specialization must be at least 3 characters';
    }

    // Years of experience validation
    if (!formData.yearsOfExperience && formData.yearsOfExperience !== 0) {
      newErrors.yearsOfExperience = 'Years of experience is required';
    } else if (formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Years of experience cannot be negative';
    } else if (formData.yearsOfExperience > 60) {
      newErrors.yearsOfExperience = 'Please enter a valid number of years';
    } else if (formData.yearsOfExperience < 1) {
      newErrors.yearsOfExperience = 'Counsellors must have at least 1 year of experience';
    }

    // Bio validation (if provided)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }

    // Qualifications validation (if provided)
    if (formData.qualifications && formData.qualifications.length > 200) {
      newErrors.qualifications = 'Qualifications cannot exceed 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await registerCounsellor({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization,
        yearsOfExperience: formData.yearsOfExperience,
        qualifications: formData.qualifications,
        bio: formData.bio
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
    <div className="counsellor-register-container">
      <div className="counsellor-register-card">
        <h1>Join as a Counsellor</h1>
        <p className="subtitle">Start helping others on their mental wellness journey</p>
        
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
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'error' : ''}
              placeholder="Enter your full name"
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="licenseNumber">License Number *</label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className={errors.licenseNumber ? 'error' : ''}
              placeholder="Enter your professional license number"
            />
            {errors.licenseNumber && <span className="error-text">{errors.licenseNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="specialization">Specialization *</label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className={errors.specialization ? 'error' : ''}
              placeholder="e.g., Anxiety, Depression, Relationships"
            />
            {errors.specialization && <span className="error-text">{errors.specialization}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="yearsOfExperience">Years of Experience *</label>
            <input
              type="number"
              id="yearsOfExperience"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className={errors.yearsOfExperience ? 'error' : ''}
              placeholder="Enter years of experience"
              min="1"
              max="60"
            />
            {errors.yearsOfExperience && <span className="error-text">{errors.yearsOfExperience}</span>}
            <small>Counsellors must have at least 1 year of experience</small>
          </div>

          <div className="form-group">
            <label htmlFor="qualifications">Qualifications</label>
            <input
              type="text"
              id="qualifications"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              className={errors.qualifications ? 'error' : ''}
              placeholder="e.g., PhD in Psychology, MA in Counseling"
            />
            {errors.qualifications && <span className="error-text">{errors.qualifications}</span>}
            <small>Maximum 200 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className={errors.bio ? 'error' : ''}
              placeholder="Tell us about your approach and experience..."
              rows="4"
              maxLength="500"
            />
            {errors.bio && <span className="error-text">{errors.bio}</span>}
            <small>{formData.bio.length}/500 characters</small>
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

export default CounsellorRegister;