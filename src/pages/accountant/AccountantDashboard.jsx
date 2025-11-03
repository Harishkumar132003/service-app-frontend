import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material'
import AppBarTop from '../../components/AppBarTop.jsx'
import { listTickets } from '../../api/tickets.js'
import { processInvoice } from '../../api/invoices.js'

export default function AccountantDashboard() {
	const [tickets, setTickets] = useState([])
	async function load(){ setTickets(await listTickets({ status: 'Accountant Processing' })) }
	useEffect(()=>{ load() },[])

	async function onProcess(t){ if (!t.invoice_id) return; await processInvoice(t.invoice_id); await load() }

	return (
		<Box>
			<AppBarTop title="Accountant Dashboard" />
			<Container maxWidth="sm" sx={{ py: 2 }}>
				<Stack spacing={1.5}>
					<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Ready for Payment</Typography>
					{tickets.filter(t=> t.invoice_id).map(t=> (
						<Card key={t.id}><CardContent>
							<Typography sx={{ fontWeight: 600 }}>{t.category}</Typography>
							<Typography variant="body2" color="text.secondary">Invoice: {t.invoice_id}</Typography>
							<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
								<Button onClick={()=>onProcess(t)}>Process Payment</Button>
							</Stack>
						</CardContent></Card>
					))}
				</Stack>
			</Container>
		</Box>
	)
}
