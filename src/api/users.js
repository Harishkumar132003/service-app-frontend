import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

function authHeader() {
  const t = localStorage.getItem('serviceapp_token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function listUsersByRole(role){
	const res = await axios.get(`${API_BASE}/users`, { params: { role }, headers: { ...authHeader() } })
	return res.data.users || []
}

export async function getCurrentUser() {
  const res = await axios.get(`${API_BASE}/users/me`, { headers: { ...authHeader() } })
  return res.data
}

export async function createUser(data) {
  const res = await axios.post(`${API_BASE}/users`, data, { headers: { ...authHeader() } })
  return res.data
}

export async function updateUser(userId, data) {
  const res = await axios.patch(`${API_BASE}/users/${userId}`, data, { headers: { ...authHeader() } })
  return res.data
}
