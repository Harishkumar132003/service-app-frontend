import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

function authHeader() {
	const t = localStorage.getItem('serviceapp_token')
	return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function listTickets() {
	const res = await axios.get(`${API_BASE}/tickets`, { headers: { ...authHeader() } })
	return res.data.tickets
}

export async function createTicket({ category, description, imageFile }) {
	const form = new FormData()
	form.append('category', category)
	form.append('description', description)
	form.append('image', imageFile)
	const res = await axios.post(`${API_BASE}/tickets`, form, { headers: { ...authHeader() } })
	return res.data
}

export async function assignTicket(ticketId, providerEmail) {
	const res = await axios.patch(`${API_BASE}/tickets/${ticketId}/assign`, { provider_email: providerEmail }, { headers: { ...authHeader() } })
	return res.data
}

export async function completeTicket(ticketId, files) {
	const form = new FormData()
	files.forEach((f) => form.append('images', f))
	const res = await axios.post(`${API_BASE}/tickets/${ticketId}/complete`, form, { headers: { ...authHeader() } })
	return res.data
}

export async function verifyTicket(ticketId) {
	const res = await axios.patch(`${API_BASE}/tickets/${ticketId}/verify`, {}, { headers: { ...authHeader() } })
	return res.data
}
