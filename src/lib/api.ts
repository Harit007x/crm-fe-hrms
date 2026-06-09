import axios from "axios";
import { useAuthStore } from "../store/auth-store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  withCredentials: true, // Required for httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (e.g., redirect to login)
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
      console.error("Unauthorized! Redirecting...");
      useAuthStore.getState().logout();
      window.location.href = "/login?expired=true";
    }
    return Promise.reject(error);
  }
);

export default api;
