import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCounsellor } from '../../services/auth';
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.licenseNumber) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = 'Years of experience is required';
    }

    if (!formData.qualifications) {
      newErrors.qualifications = 'Qualifications are required';
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
      const response = await registerCounsellor({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        licenseNumber: formData.licenseNumber,
        specialization: formData.specialization.split(',').map(s => s.trim()),
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        qualifications: formData.qualifications.split(',').map(q => q.trim()),
        bio: formData.bio
      });

      alert(response.data.message);
      console.log('Registration response:', response.data);
      
      // Redirect to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          email: formData.email,
          message: 'Please check your email for the verification code. After verification, your account will be pending admin approval.'
        }
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="counsellor-register-container">
      <div className="counsellor-register-card">
        <h1>Join as a Counsellor</h1>
        <p className="subtitle">Help others on their mental wellness journey</p>
        
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
            <small>Separate multiple specializations with commas</small>
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
              min="0"
            />
            {errors.yearsOfExperience && <span className="error-text">{errors.yearsOfExperience}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="qualifications">Qualifications *</label>
            <input
              type="text"
              id="qualifications"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              className={errors.qualifications ? 'error' : ''}
              placeholder="e.g., M.A. in Psychology, PhD in Counselling"
            />
            <small>Separate multiple qualifications with commas</small>
            {errors.qualifications && <span className="error-text">{errors.qualifications}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about yourself and your approach to counselling"
            ></textarea>
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