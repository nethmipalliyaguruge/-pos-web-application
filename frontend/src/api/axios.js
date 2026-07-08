import axios from "axios";

// One shared axios instance for the whole app.
// baseURL comes from .env so we don't repeat the backend URL everywhere.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Before every request, attach the JWT token (if we have one) so the
// backend's `protect` middleware lets us through.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If any request comes back 401 (token missing/expired/invalid), the session
// is no longer valid — clear it and send the user to the login page.
// (403 is left alone: that's "logged in but not allowed", e.g. a cashier
// hitting an admin route — we don't want to log them out for that.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Avoid redirect loops if we're already on the login page.
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;