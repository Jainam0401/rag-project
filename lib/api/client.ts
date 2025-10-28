import axios from 'axios';


export const apiClient = axios.create({
  baseURL: "/",
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