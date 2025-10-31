import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export async function listUsersByRole(role){
	const res = await axios.get(`${API_BASE}/users`, { params: { role } })
	return res.data.users || []
}
