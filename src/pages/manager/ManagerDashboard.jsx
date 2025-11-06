import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Container, Stack, Typography, Dialog, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material'
import ManagerLayout from '../../components/ManagerLayout.jsx'
import { listTickets } from '../../api/tickets.js'
import { approveInvoice, rejectInvoice, fetchInvoiceImageBlob } from '../../api/invoices.js'
import TicketDetails from '../../components/TicketDetails.jsx'
import { useNavigate } from 'react-router-dom'

export default function ManagerDashboard() {
    const navigate = useNavigate()
	const [tickets, setTickets] = useState([])
    const [imageOpen, setImageOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [invFilter, setInvFilter] = useState('pending') // pending|approved|rejected
	async function load(){ setTickets(await listTickets()) }
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

    const filtered = tickets.filter(t => {
        const st = (t.invoice_status || '').toLowerCase()
        if (invFilter === 'approved') return st === 'approved'
        if (invFilter === 'rejected') return st === 'rejected'
        return st === 'pending manager approval' || st === 'pending' || !st
    })

	return (
		<ManagerLayout title="Dashboard">
			<Container maxWidth="lg">
                <Stack direction='row' justifyContent='flex-end'>
                            <Button
                              variant='text'
                              size='small'
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/manager/history');
                              }}
                            >
                              View Full Details
                            </Button>
                            </Stack>
				<Stack spacing={1.5}>
					<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Invoices Pending Approval</Typography>
					<Stack direction="row" spacing={1} alignItems="center">
						<TextField size="small" select label="Filter" value={invFilter} onChange={(e)=>setInvFilter(e.target.value)} sx={{ width: 220 }}>
							<MenuItem value="pending">Wait for Approval</MenuItem>
							<MenuItem value="approved">Approved</MenuItem>
							<MenuItem value="rejected">Rejected</MenuItem>
						</TextField>
					</Stack>
					<Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
						{filtered.filter(t=> t.invoice_id).length === 0 && (
							<Typography variant="body2" color="text.secondary">No data available</Typography>
						)}
						<Stack spacing={1.5}>
						{filtered.filter(t=> t.invoice_id).map(t=> (
							<Card key={t.id} onClick={()=>openDetails(t)} sx={{ cursor: 'pointer' }}><CardContent>
								<Typography sx={{ fontWeight: 600 }}>{t.category}</Typography>
								<Typography variant="body2" color="text.secondary">Invoice: {t.invoice_id}</Typography>
								<Typography variant="body1" sx={{ mt: .5, fontWeight: 600 }}>Amount: {typeof t.invoice_amount === 'number' ? t.invoice_amount.toFixed(2) : t.invoice_amount}</Typography>
								{t.invoice_updated_by && (
									<Typography variant="caption" color="text.secondary">Updated by: {t.invoice_updated_by}</Typography>
								)}
								<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
									{t.invoice_status == 'Pending Manager Approval' && (
									<Button onClick={(e)=>{ e.stopPropagation(); onApprove(t) }}>Approve</Button>
									)}
									{t.invoice_status == 'Pending Manager Approval' && (
									<Button variant="outlined" onClick={(e)=>{ e.stopPropagation(); onReject(t) }}>Reject</Button>
									)}
									{t.invoice_has_image && (
										<Button variant="text" onClick={(e)=>{ e.stopPropagation(); onViewInvoiceImage(t) }}>View Invoice Image</Button>
									)}
								</Stack>
							</CardContent></Card>
						))}
						</Stack>
					</Box>
				</Stack>
		        <Dialog open={imageOpen} onClose={closeImage} fullWidth maxWidth="sm">
            <DialogTitle>Invoice Image</DialogTitle>
            <DialogContent>
                {imageUrl && (<img src={imageUrl} alt="invoice" style={{ maxWidth: '100%', borderRadius: 4 }} />)}
            </DialogContent>
        </Dialog>
        <TicketDetails open={detailsOpen} onClose={closeDetails} ticket={selectedTicket} />
			</Container>
		</ManagerLayout>
	)
}
