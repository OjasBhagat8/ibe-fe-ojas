import axios from 'axios';

const HK_BASE_URL = import.meta.env.VITE_HK_API_URL ?? 'http://localhost:8081';
const TOKEN_KEY = 'hk_token';

export const housekeepingClient = axios.create({
  baseURL: HK_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
housekeepingClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear the stored token so AuthGuard redirects to login
housekeepingClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  },
);

export const TOKEN_STORAGE_KEY = TOKEN_KEY;
