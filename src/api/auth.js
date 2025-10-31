import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export async function loginRequest(identifier, password){
	try {
		const res = await axios.post(`${API_BASE}/auth/login`, { email: identifier, password })
		return { ok: true, token: res.data.token, role: res.data.role }
	} catch (e) {
		const msg = e?.response?.data?.error || 'Login failed'
		return { ok: false, error: msg }
	}
}

export async function verifyToken(token){
	try {
		const res = await axios.get(`${API_BASE}/auth/verify`, { headers: { Authorization: `Bearer ${token}` } })
		return res.data
	} catch (e) {
		return { valid: false, error: e?.response?.data?.error || 'Invalid token' }
	}
}
