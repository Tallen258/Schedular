import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Get the OIDC user from localStorage (stored by react-oidc-context)
  const oidcStorageKey = `oidc.user:https://auth-dev.snowse.io/realms/DevRealm:taft-chat`;
  const oidcStorage = localStorage.getItem(oidcStorageKey);
  
  if (oidcStorage) {
    try {
      const user = JSON.parse(oidcStorage);
      if (user?.access_token) {
        config.headers.Authorization = `Bearer ${user.access_token}`;
      }
    } catch (e) {
      console.error('Failed to parse OIDC token', e);
    }
  }
  
  return config;
});

export const apiService = {
  checkHealth: () => api.get('/health'),

  getWhoAmI: () => api.get('/whoami'),


};

export default api;