import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

function authHeader() {
	const t = localStorage.getItem('serviceapp_token')
	return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function listTickets(filters = {}) {
	const params = new URLSearchParams()
	if (filters.status) {
		if (Array.isArray(filters.status)) {
			params.append('status', filters.status.join(','))
		} else {
			params.append('status', filters.status)
		}
	}
	if (filters.category) params.append('category', filters.category)
	if (filters.assigned_provider) params.append('assigned_provider', filters.assigned_provider)
	if (filters.created_by) params.append('created_by', filters.created_by)
	if (filters.created_after) params.append('created_after', filters.created_after)
	if (filters.created_before) params.append('created_before', filters.created_before)
	if (filters.sort) params.append('sort', filters.sort)
	
	const queryString = params.toString()
	const url = queryString ? `${API_BASE}/tickets?${queryString}` : `${API_BASE}/tickets`
	const res = await axios.get(url, { headers: { ...authHeader() } })
	return res.data.tickets
}

export async function createTicket({ category, description, imageFile }) {
	const form = new FormData()
	form.append('category', category)
	form.append('description', description)
	if (imageFile) {
	form.append('image', imageFile)
	
}
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
