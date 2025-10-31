import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material'
import AppBarTop from '../../components/AppBarTop.jsx'
import { listTickets } from '../../api/tickets.js'
import { approveInvoice, rejectInvoice } from '../../api/invoices.js'

export default function ManagerDashboard() {
	const [tickets, setTickets] = useState([])
	async function load(){ setTickets(await listTickets()) }
	useEffect(()=>{ load() },[])

	async function onApprove(t){ if (!t.invoice_id) return; await approveInvoice(t.invoice_id); await load() }
	async function onReject(t){ if (!t.invoice_id) return; await rejectInvoice(t.invoice_id); await load() }

	return (
		<Box>
			<AppBarTop title="Manager Dashboard" />
			<Container maxWidth="sm" sx={{ py: 2 }}>
				<Stack spacing={1.5}>
					<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Invoices Pending Approval</Typography>
					{tickets.filter(t=> t.status==='Manager Approval' && t.invoice_id).map(t=> (
						<Card key={t.id}><CardContent>
							<Typography sx={{ fontWeight: 600 }}>{t.category}</Typography>
							<Typography variant="body2" color="text.secondary">Invoice: {t.invoice_id}</Typography>
							<Typography variant="body1" sx={{ mt: .5, fontWeight: 600 }}>Amount: {typeof t.invoice_amount === 'number' ? t.invoice_amount.toFixed(2) : t.invoice_amount}</Typography>
							<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
								<Button onClick={()=>onApprove(t)}>Approve</Button>
								<Button variant="outlined" onClick={()=>onReject(t)}>Reject</Button>
							</Stack>
						</CardContent></Card>
					))}
				</Stack>
			</Container>
		</Box>
	)
}
