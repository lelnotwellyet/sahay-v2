import axios from 'axios';

// For production, use environment variable; for development, use localhost
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_BASE_URL 
  : 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
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

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
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

export const availabilityService = {
  updateAvailability: (isAvailable) => api.put('/counsellors/availability', { isAvailable }),
  // NEW: Availability schedule endpoints
  getCounsellorSchedule: () => api.get('/availability/counsellor/schedule'),
  updateCounsellorSchedule: (data) => api.put('/availability/counsellor/schedule', data),
  getAvailableSlots: (counsellorId, date) => api.get(`/availability/counsellor/${counsellorId}/available-slots?date=${date}`),
  checkSlotAvailability: (counsellorId, date, startTime, endTime) => 
    api.get(`/availability/counsellor/${counsellorId}/check-slot?date=${date}&startTime=${startTime}&endTime=${endTime}`),
};

export const sessionService = {
  book: (data) => api.post('/sessions/book', data),
  getCounsellorSessions: () => api.get('/sessions/counsellor'),
  getClientSessions: () => api.get('/sessions/client'),
  accept: (id) => api.put(`/sessions/${id}/accept`),
  reject: (id) => api.put(`/sessions/${id}/reject`),
  complete: (id) => api.put(`/sessions/${id}/complete`),
  cancel: (id) => api.put(`/sessions/${id}/cancel`), 
  review: (id, data) => api.put(`/sessions/${id}/review`, data),
};

// START: NEW GEMINI SERVICE
export const geminiService = {
  // This points to the new backend route /api/gemini/chat
  sendMessage: (message, history) => api.post('/gemini/chat', { message, chatHistory: history }),
};
// END: NEW GEMINI SERVICE

export default api;