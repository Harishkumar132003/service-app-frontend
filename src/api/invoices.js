import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

function authHeader() {
	const t = localStorage.getItem('serviceapp_token')
	return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function createInvoice(ticketId, { amount, imageFile } = {}) {
    // If an image is present or amount is undefined/null, use multipart
    if (imageFile || amount === undefined || amount === null || `${amount}`.trim() === '') {
        const form = new FormData()
        form.append('ticket_id', ticketId)
        if (amount !== undefined && amount !== null && `${amount}`.trim() !== '') {
            form.append('amount', amount)
        }
        if (imageFile) {
            form.append('image', imageFile)
        }
        const res = await axios.post(`${API_BASE}/invoices`, form, { headers: { ...authHeader() } })
        return res.data
    }
    // JSON path when only amount is provided
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

export async function markPaid(invoiceId, paymentImageFile){
    if (paymentImageFile){
        const form = new FormData()
        form.append('payment_image', paymentImageFile)
        const res = await axios.patch(`${API_BASE}/invoices/${invoiceId}/process`, form, { headers: { ...authHeader() } })
        return res.data
    }
    const res = await axios.patch(`${API_BASE}/invoices/${invoiceId}/process`, {}, { headers: { ...authHeader() } })
    return res.data
}

export async function fetchInvoiceImageBlob(invoiceId){
    const res = await axios.get(`${API_BASE}/invoices/${invoiceId}/image`, {
        headers: { ...authHeader() },
        responseType: 'blob'
    })
    return res.data // Blob
}
