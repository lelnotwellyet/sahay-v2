import API from './api';

export const registerClient = (userData) => API.post('/api/auth/register/client', userData);
export const registerCounsellor = (userData) => API.post('/api/auth/register/counsellor', userData);
export const loginUser = (userData) => API.post('/api/auth/login', userData);
export const verifyOTP = (otpData) => API.post('/api/auth/verify-otp', otpData);
export const resendOTP = (emailData) => API.post('/api/auth/resend-otp', emailData);

// Store token and user data in localStorage
export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove auth data from localStorage
export const removeAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get stored user data
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get stored token
export const getToken = () => {
  return localStorage.getItem('token');
};