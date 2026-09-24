import axios from 'axios';

const normalizeBaseURL = (url) => {
  if (!url) return '/api';
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned) return '/api';
  if (!cleaned.endsWith('/api')) {
    cleaned += '/api';
  }
  return cleaned;
};

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return normalizeBaseURL(envUrl.trim());
  }
  const customUrl = localStorage.getItem('clinovexa_api_url');
  if (customUrl && customUrl.trim()) {
    return normalizeBaseURL(customUrl.trim());
  }
  // When running on Vercel frontend (clinovexa.vercel.app) without VITE_API_BASE_URL set,
  // automatically target the Render backend (https://clinovexa.onrender.com/api).
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://clinovexa.onrender.com/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clinovexa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling & 401 auto logout
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      localStorage.removeItem('clinovexa_token');
      localStorage.removeItem('clinovexa_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response ? error.response.data : { message: error.message });
  }
);

export default api;
