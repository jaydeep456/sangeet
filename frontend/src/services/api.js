import axios from 'axios';

// In production (Vercel), set VITE_API_URL to your Render backend URL
// In development, Vite proxy handles /api → localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.response.use(
  res => res,
  err => Promise.reject(new Error(err?.response?.data?.message || err.message || 'An error occurred'))
);

export const getProducts   = (search = '', size = '') =>
  api.get('/products', { params: { ...(search && { search }), ...(size && size !== 'All' && { size }) } });

export const getProductById = id => api.get(`/products/${id}`);

export const createProduct = formData =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteProduct = id => api.delete(`/products/${id}`);
