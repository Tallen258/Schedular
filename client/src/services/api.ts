import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add authentication interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const apiService = {
  // Health check
  checkHealth: () => api.get('/api/health'),

  // User info
  getWhoAmI: () => api.get('/api/whoami'),

  // Add more API endpoints here as needed for your application
  // Example:
  // createEvent: (data) => api.post('/api/events', data),
  // getEvents: () => api.get('/api/events'),
  // updateEvent: (id, data) => api.put(`/api/events/${id}`, data),
  // deleteEvent: (id) => api.delete(`/api/events/${id}`),
};

export default api;