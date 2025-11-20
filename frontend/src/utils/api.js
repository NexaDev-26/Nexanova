import axios from 'axios';

const base = process.env.REACT_APP_API_URL || (() => {
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${host}:5000/api`;
})();

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
