import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Container, MenuItem, Stack, TextField, Typography } from '@mui/material'
import AppBarTop from '../../components/AppBarTop.jsx'
import { listTickets, assignTicket } from '../../api/tickets.js'
import { createInvoice } from '../../api/invoices.js'
import { listUsersByRole } from '../../api/users.js'

export default function AdminDashboard() {
	const [tickets, setTickets] = useState([])
	const [amountMap, setAmountMap] = useState({})
	const [assignMap, setAssignMap] = useState({})
	const [providers, setProviders] = useState([])

	async function load() {
		const [t, prov] = await Promise.all([
			listTickets(),
			listUsersByRole('serviceprovider')
		])
		setTickets(t)
		setProviders(prov)
	}
	useEffect(()=>{ load() },[])

	async function onCreateInvoice(t) {
		const amount = parseFloat(amountMap[t.id] || '0')
		if (!amount || amount <= 0) return
		await createInvoice(t.id, amount)
		await load()
	}

	async function onAssign(t) {
		const email = (assignMap[t.id] || '').trim().toLowerCase()
		if (!email) return
		await assignTicket(t.id, email)
		await load()
	}

	return (
		<Box>
			<AppBarTop title="Admin Dashboard" />
			<Container maxWidth="sm" sx={{ py: 2 }}>
				<Stack spacing={1.5}>
					<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pending Review</Typography>
					{tickets.filter(t=> t.status==='Submitted' || t.status==='Admin Review').map(t=> (
						<Card key={t.id}><CardContent>
							<Typography sx={{ fontWeight: 600 }}>{t.category} - {t.status}</Typography>
							<Typography variant="body2" color="text.secondary">{t.description}</Typography>
							<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
								<TextField size="small" type="number" placeholder="Amount" value={amountMap[t.id]||''} onChange={e=>setAmountMap(v=>({...v,[t.id]:e.target.value}))} sx={{ flex: 1 }} />
								<Button onClick={()=>onCreateInvoice(t)}>Create Invoice</Button>
							</Stack>
						</CardContent></Card>
					))}

					<Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>Assign to Provider</Typography>
					{tickets.filter(t=> t.status==='Service Provider Assignment' && !t.assigned_provider.length).map(t=> (
						<Card key={t.id}><CardContent>
							<Typography sx={{ fontWeight: 600 }}>{t.category} - {t.status}</Typography>
							<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
								<TextField size="small" select placeholder="Select provider" value={assignMap[t.id]||''} onChange={e=>setAssignMap(v=>({...v,[t.id]:e.target.value}))} sx={{ flex: 1 }}>
									{providers.map(p=> (
										<MenuItem key={p.email} value={p.email}>{p.email}</MenuItem>
									))}
								</TextField>
								<Button onClick={()=>onAssign(t)}>Assign</Button>
							</Stack>
						</CardContent></Card>
					))}
				</Stack>
			</Container>
		</Box>
	)
}
