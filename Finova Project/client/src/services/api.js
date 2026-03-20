// src/services/api.js
import axios from "axios";
import toast from "react-hot-toast";

// --------------------
// Base URL
// --------------------
const BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  "/api";

// --------------------
// Axios instance
// --------------------
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// --------------------
// Request interceptor
// --------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// --------------------
// Response interceptor
// --------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (data?.error) toast.error(data.error);
    else if (status >= 500) toast.error("Server error. Please try again later.");
    else toast.error("An error occurred");

    return Promise.reject(error);
  }
);

// --------------------
// Auth API
// --------------------
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
};

// --------------------
// Business API
// --------------------
export const businessAPI = {
  getDetails: () => api.get("/business"),
  createOrUpdate: (formData) =>
    api.post("/business", formData, { headers: { "Content-Type": "multipart/form-data" } }),

  // FRONTEND ONLY PIN verify
  verifyPin: (pin, type) =>
    new Promise((resolve, reject) => {
      if (pin === "1266") {
        localStorage.setItem(`${type}ReportsToken`, "verified");
        resolve({ success: true, message: "PIN verified successfully" });
      } else {
        reject({ success: false, message: "Invalid PIN" });
      }
    }),
};

// --------------------
// Items API
// --------------------
export const itemsAPI = {
  getAll: (params) => api.get("/items", { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (formData) =>
    api.post("/items", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.put(`/items/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id) => api.delete(`/items/${id}`),
};

// --------------------
// Orders API
// --------------------
export const ordersAPI = {
  getAll: (params) => api.get("/orders", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

// --------------------
// Reports API
// --------------------
export const reportsAPI = {
  getOrderReports: (params) => api.get("/reports/orders", { params }),
  getItemReports: (params) => api.get("/reports/items", { params }),
  getDailyReports: (params) => api.get("/reports/daily", { params }),
  getTopItems: (params) => api.get("/reports/top-items", { params }),
};

// --------------------
// PSG API (optional)
// --------------------
export const psgAPI = {
  getReports: (params) => api.get("/psg/reports", { params }),
  getOrderHistory: (params) => api.get("/psg/orders", { params }),
  getItemDetails: (itemId, params) => api.get(`/psg/items/${itemId}`, { params }),
};

// --------------------
// Default export
// --------------------
export default api;
