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
  // Relative `/api` works for local Vite proxy AND monorepo production
  // (Vercel rewrites `/api/*` -> serverless `api/index.js`).
  // For frontend-only hosting, set VITE_API_BASE_URL to the backend URL.
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
