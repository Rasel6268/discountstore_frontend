import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.discountstorebd.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;


export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getTree: () => api.get('/categories/tree'),
  getOne: (identifier) => api.get(`/categories/${identifier}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id, reassignTo) => api.delete(`/categories/${id}${reassignTo ? `?reassignTo=${reassignTo}` : ''}`),
  getBreadcrumb: (id) => api.get(`/categories/${id}/breadcrumb`),
  getDescendants: (id) => api.get(`/categories/${id}/descendants`),
};

export const orderAPI = {
  track: (orderId, phone) =>
    api.get(`/orders/track/${encodeURIComponent(orderId)}${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`),
  trackPost: (data) => api.post('/orders/track', data),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  getMyOrders: (userId) =>
    api.get(userId ? `/orders/myorder/${encodeURIComponent(userId)}` : `/orders/myorder`),
  cancel: (orderId, reason) =>
    api.put(`/orders/cancel/${encodeURIComponent(orderId)}`, { reason }),
  change: (orderId, updateData) =>
    api.put(`/orders/change/${encodeURIComponent(orderId)}`, updateData),
};