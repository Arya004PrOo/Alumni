import axios from "axios";

export const getAuthToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

const client = axios.create({
  baseURL: "", // Proxied to port 8009 by Vite
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to inject the JWT Bearer token into headers dynamically
client.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to catch 401 Unauthorized errors and redirect users to the SSO portal
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Redirecting to SSO portal...");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      
      const authUrl = import.meta.env.VITE_AUTH_URL || "https://automatic-certify-appointee.ngrok-free.dev";
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `${authUrl}/login?redirect=${currentUrl}`;
    }
    return Promise.reject(error);
  }
);

export default client;
