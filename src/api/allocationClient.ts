import axios from 'axios';

const ALLOCATION_BASE_URL = import.meta.env.VITE_ALLOCATION_API_URL ?? 'http://localhost:8082';
const TOKEN_KEY = 'hk_token';

export const allocationClient = axios.create({
  baseURL: ALLOCATION_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

allocationClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
