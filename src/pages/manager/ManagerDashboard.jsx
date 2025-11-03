import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Container, Stack, Typography, Dialog, DialogContent, DialogTitle } from '@mui/material'
import AppBarTop from '../../components/AppBarTop.jsx'
import { listTickets } from '../../api/tickets.js'
import { approveInvoice, rejectInvoice, fetchInvoiceImageBlob } from '../../api/invoices.js'
import TicketDetails from '../../components/TicketDetails.jsx'

export default function ManagerDashboard() {
	const [tickets, setTickets] = useState([])
    const [imageOpen, setImageOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
	async function load(){ setTickets(await listTickets({ status: 'Manager Approval' })) }
	useEffect(()=>{ load() },[])

	async function onApprove(t){ if (!t.invoice_id) return; await approveInvoice(t.invoice_id); await load() }
	async function onReject(t){ if (!t.invoice_id) return; await rejectInvoice(t.invoice_id); await load() }

    async function onViewInvoiceImage(t){
        if (!t.invoice_id) return
        try {
            const blob = await fetchInvoiceImageBlob(t.invoice_id)
            const url = URL.createObjectURL(blob)
            setImageUrl(url)
            setImageOpen(true)
        } catch (e) {
            console.error('Failed to load invoice image', e)
        }
    }

    function closeImage(){
        setImageOpen(false)
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl)
            setImageUrl('')
        }
    }

    function openDetails(t){
        setSelectedTicket(t)
        setDetailsOpen(true)
    }

    function closeDetails(){
        setDetailsOpen(false)
        setSelectedTicket(null)
    }

	return (
		<Box>
			<AppBarTop title="Manager Dashboard" />
			<Container maxWidth="sm" sx={{ py: 2 }}>
				<Stack spacing={1.5}>
					<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Invoices Pending Approval</Typography>
					{tickets.filter(t=> t.invoice_id).map(t=> (
						<Card key={t.id} onClick={()=>openDetails(t)} sx={{ cursor: 'pointer' }}><CardContent>
							<Typography sx={{ fontWeight: 600 }}>{t.category}</Typography>
							<Typography variant="body2" color="text.secondary">Invoice: {t.invoice_id}</Typography>
							<Typography variant="body1" sx={{ mt: .5, fontWeight: 600 }}>Amount: {typeof t.invoice_amount === 'number' ? t.invoice_amount.toFixed(2) : t.invoice_amount}</Typography>
							<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
								<Button onClick={(e)=>{ e.stopPropagation(); onApprove(t) }}>Approve</Button>
								<Button variant="outlined" onClick={(e)=>{ e.stopPropagation(); onReject(t) }}>Reject</Button>
                                {t.invoice_has_image && (
                                    <Button variant="text" onClick={(e)=>{ e.stopPropagation(); onViewInvoiceImage(t) }}>View Invoice Image</Button>
                                )}
							</Stack>
						</CardContent></Card>
					))}
				</Stack>
			</Container>
		        <Dialog open={imageOpen} onClose={closeImage} fullWidth maxWidth="sm">
            <DialogTitle>Invoice Image</DialogTitle>
            <DialogContent>
                {imageUrl && (<img src={imageUrl} alt="invoice" style={{ maxWidth: '100%', borderRadius: 4 }} />)}
            </DialogContent>
        </Dialog>
        <TicketDetails open={detailsOpen} onClose={closeDetails} ticket={selectedTicket} />
		</Box>
	)
}
