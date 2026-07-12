import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/users/me'),
};

// Tenant
export const tenantAPI = {
  create: (data) => api.post('/tenant/create', data),
  get: (id) => api.get(`/tenant/${id}`),
};

// Products
export const productAPI = {
  list: () => api.get('/products'),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Inventory
export const inventoryAPI = {
  list: () => api.get('/inventory'),
  create: (data) => api.post('/inventory', data),
  update: (productId, data) => api.put(`/inventory/${productId}`, data),
};

// Orders / Billing
export const billingAPI = {
  createOrder: (data) => api.post('/orders', data),
  listOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
};

// Reports
export const reportAPI = {
  sales: () => api.get('/reports/sales'),
};

// Razorpay — creates a Razorpay order on backend
export const paymentAPI = {
  createRazorpayOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
};

export default api;

// User Management — Admin only
export const userAPI = {
  list: () => api.get('/users'),
  create: (data) => api.post('/auth/register', data),
  delete: (id) => api.delete(`/users/${id}`),
};
