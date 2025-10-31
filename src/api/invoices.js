import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

function authHeader() {
	const t = localStorage.getItem('serviceapp_token')
	return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function createInvoice(ticketId, amount) {
	const res = await axios.post(`${API_BASE}/invoices`, { ticket_id: ticketId, amount }, { headers: { ...authHeader() } })
	return res.data
}

export async function approveInvoice(invoiceId) {
	const res = await axios.patch(`${API_BASE}/invoices/${invoiceId}/approve`, {}, { headers: { ...authHeader() } })
	return res.data
}

export async function rejectInvoice(invoiceId) {
	const res = await axios.patch(`${API_BASE}/invoices/${invoiceId}/reject`, {}, { headers: { ...authHeader() } })
	return res.data
}

export async function processInvoice(invoiceId) {
	const res = await axios.patch(`${API_BASE}/invoices/${invoiceId}/process`, {}, { headers: { ...authHeader() } })
	return res.data
}
