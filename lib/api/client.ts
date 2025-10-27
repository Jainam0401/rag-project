import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    const parsedToken = JSON.parse(token);
    if (parsedToken.state?.token) {
      config.headers.Authorization = `Bearer ${parsedToken.state.token}`;
    }
  }
  return config;
});

export const authApi = {
  signup: async (email: string, password: string, name: string) => {
    const response = await apiClient.post('api/auth/signup', { email, password, name });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await apiClient.post('api/auth/login', { email, password });
    return response.data;
  },
};