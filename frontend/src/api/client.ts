import axios from "axios";

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to inject JWT token dynamically from localStorage
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or invalid token. Redirecting to SSO portal...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      const currentUrl = encodeURIComponent(window.location.href);
      const authUrl = import.meta.env.VITE_AUTH_URL || "https://automatic-certify-appointee.ngrok-free.dev";
      window.location.href = `${authUrl}/login?redirect=${currentUrl}`;
    }
    return Promise.reject(error);
  }
);
