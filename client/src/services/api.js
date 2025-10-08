import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  registerClient: (data) => api.post('/auth/register/client', data),
  registerCounsellor: (data) => api.post('/auth/register/counsellor', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
};

export const counsellorService = {
  getAll: () => api.get('/counsellors'),
  getById: (id) => api.get(`/counsellors/${id}`),
};

export const sessionService = {
  book: (data) => api.post('/sessions/book', data),
  getCounsellorSessions: () => api.get('/sessions/counsellor'),
  getClientSessions: () => api.get('/sessions/client'),
  accept: (id) => api.put(`/sessions/${id}/accept`),
  reject: (id) => api.put(`/sessions/${id}/reject`),
  complete: (id) => api.put(`/sessions/${id}/complete`),
  cancel: (id) => api.put(`/sessions/${id}/cancel`), 
};

export default api;