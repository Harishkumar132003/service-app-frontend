import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function authHeader() {
  const t = localStorage.getItem('serviceapp_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function createCategory(data) {
  const res = await axios.post(`${API_BASE}/categories`, data, {
    headers: { ...authHeader() },
  });
  return res.data;
}

export async function listCategories() {
  const res = await axios.get(`${API_BASE}/categories`, {
    headers: { ...authHeader() },
  });
  return res.data;
}
