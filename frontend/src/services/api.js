import axios from 'axios';

// In production (Vercel), set VITE_API_URL to your Render backend URL
// In development, Vite proxy handles /api → localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 20000 });

// Attach JWT token to every request if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('sangeet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  err => Promise.reject(err)
);

api.interceptors.response.use(
  res => res,
  err => Promise.reject(new Error(err?.response?.data?.message || err.message || 'An error occurred'))
);

// Auth operations
export const login  = (username, password) => api.post('/auth/login', { username, password });
export const signup = (username, password) => api.post('/auth/signup', { username, password });

// Products — enhanced filters: search, size, category, minPrice, maxPrice, sort, ids
export const getProducts = ({ search = '', size = '', category = '', minPrice = '', maxPrice = '', sort = 'newest', ids = '' } = {}) =>
  api.get('/products', {
    params: {
      ...(search                            && { search }),
      ...(size     && size     !== 'All'    && { size }),
      ...(category && category !== 'All'    && { category }),
      ...(minPrice !== ''                   && { minPrice }),
      ...(maxPrice !== ''                   && { maxPrice }),
      ...(sort     && sort     !== 'newest' && { sort }),
      ...(ids                               && { ids }),
    },
  });

export const getProductById = id => api.get(`/products/${id}`);

// Create — images is a FileList or File[]
export const createProduct = formData =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Update — formData may include removeImages JSON + new image files
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteProduct = id => api.delete(`/products/${id}`);

// Groups
export const createGroup = (name, products) => api.post('/groups', { name, products });
export const getGroups = () => api.get('/groups');
