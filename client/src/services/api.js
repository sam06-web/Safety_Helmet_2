import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

// Helmets
export const getLatestReadings = () => api.get('/helmets/latest');
export const getHelmetHistory = (id) => api.get(`/helmets/${id}/history`);
export const getHelmetStats = () => api.get('/helmets/stats');

// Alerts
export const getActiveAlerts = () => api.get('/alerts/active');
export const getAlertHistory = () => api.get('/alerts/history');

// Settings
export const getThresholds = () => api.get('/settings/thresholds');
export const updateThresholds = (data) => api.put('/settings/thresholds', data);

export default api;
