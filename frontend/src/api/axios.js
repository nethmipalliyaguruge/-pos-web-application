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

export default api;