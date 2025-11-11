import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Container, Stack, Typography, Dialog, DialogContent, DialogTitle, Chip, LinearProgress, Skeleton, Avatar } from '@mui/material'
import { CheckCircle, HourglassBottom, Cancel, AttachMoney, Business } from '@mui/icons-material'
import ManagerLayout from '../../components/ManagerLayout.jsx'
import { listTickets } from '../../api/tickets.js'
import { approveInvoice, rejectInvoice, fetchInvoiceImageBlob } from '../../api/invoices.js'
import TicketDetails from '../../components/TicketDetails.jsx'
import { useNavigate } from 'react-router-dom'

export default function ManagerDashboard() {
    const navigate = useNavigate()
	const [tickets, setTickets] = useState([])
    const [fetching, setFetching] = useState(false)
    const [imageOpen, setImageOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)

    const STATUS_CHIPS = [
        { key: 'pending', label: 'Pending', icon: <HourglassBottom fontSize="small" /> },
        { key: 'approved', label: 'Approved', icon: <CheckCircle fontSize="small" /> },
        { key: 'rejected', label: 'Rejected', icon: <Cancel fontSize="small" /> },
    ]
    const [activeStatus, setActiveStatus] = useState(STATUS_CHIPS[0].key)

    async function load(){
        setFetching(true)
        try {
            const data = await listTickets()
            setTickets(data)
        } finally {
            setFetching(false)
        }
    }
    useEffect(()=>{ load() }, [activeStatus])

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

    function ticketStatusKey(t){
        const st = (t.invoice_status || '').toLowerCase()
        if (st === 'approved') return 'approved'
        if (st === 'rejected') return 'rejected'
        return 'pending'
    }

    const counts = tickets.reduce((acc, t) => {
        if (!t.invoice_id) return acc
        const k = ticketStatusKey(t)
        acc[k] = (acc[k] || 0) + 1
        return acc
    }, { pending: 0, approved: 0, rejected: 0 })

    const filtered = tickets.filter(t => {
        if (!t.invoice_id) return false
        return ticketStatusKey(t) === activeStatus
    })

	return (
		<ManagerLayout title="Dashboard">
			<Container maxWidth="lg">
				<Stack spacing={1.5} >
					<Box sx={{
						background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
						borderRadius: 3,
						p: 2,
						color: 'white'
					}}>
						<Typography variant="h6" sx={{ fontWeight: 700 }}>Manager Dashboard</Typography>
						<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
							<Chip label={`Pending: ${counts.pending}`} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}  />
							<Chip label={`Approved: ${counts.approved}`} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }} />
							<Chip label={`Rejected: ${counts.rejected}`} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }} />
						</Stack>
					</Box>
					<Box sx={{ position: 'sticky', top: 56, zIndex: 1,  pb: 1 }}>
						<Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', WebkitOverflowScrolling: 'touch', px: 3,justifyContent:'space-between' }}>
                            {STATUS_CHIPS.map(c => {
                                const active = activeStatus === c.key
                                return (
                                    <Chip
                                        key={c.key}
                                        label={`${c.label}`}
                                        onClick={() => { if (activeStatus !== c.key) setActiveStatus(c.key) }}
                                        color={active ? 'primary' : 'default'}
                                        variant={active ? 'filled' : 'outlined'}
                                        
                                        sx={{ height: 44, borderRadius: 3, flex: '0 0 auto' }}
                                    />
                                )
                            })}
                        </Box>
                        {fetching && <LinearProgress sx={{ mt: 1 }} />}
                    </Box>

					<Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
						{fetching ? (
							<Stack spacing={1.5}>
								{Array.from({ length: 3 }).map((_, i) => (
									<Card key={i}><CardContent>
										<Skeleton height={20} width="40%" />
										<Skeleton height={16} width="60%" />
										<Skeleton height={16} width="30%" />
									</CardContent></Card>
								))}
							</Stack>
						) : filtered.length === 0 ? (
							<Typography variant="body2" color="text.secondary">No results</Typography>
						) : (
							<Stack spacing={1.5}>
							{filtered.map(t=> (
								<Card key={t.id} onClick={()=>openDetails(t)} sx={{ cursor: 'pointer', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                                    <CardContent>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography sx={{ fontWeight: 700 }}>{t.category}</Typography>
                                            <Chip size="small" label={t.invoice_status || 'Pending Manager Approval'} color={ticketStatusKey(t) === 'approved' ? 'success' : ticketStatusKey(t) === 'rejected' ? 'error' : 'warning'} variant="outlined" />
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: .5 }}>
                                            {/* Priority */}
                                            <Chip size="small" label={(t.priority || 'medium').charAt(0).toUpperCase() + (t.priority || 'medium').slice(1)} sx={{ bgcolor: (t.priority==='urgent'?'#fee2e2': (t.priority==='low'?'#f1f5f9':'#dbeafe')), color: (t.priority==='urgent'?'#ef4444': (t.priority==='low'?'#475569':'#1e40af')) }} />
                                            {typeof t.invoice_amount === 'number' && <AttachMoney fontSize="small" color="action" />}
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{typeof t.invoice_amount === 'number' ? t.invoice_amount.toFixed(2) : t.invoice_amount}</Typography>
                                        </Stack>
                                        {t.company_id && (
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: .25 }}>
                                                <Business fontSize="small" color="action" />
                                                <Typography variant="caption" color="text.secondary">Company: {t.company_id}</Typography>
                                            </Stack>
                                        )}
                                        {t.invoice_updated_by && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: .5, display: 'block' }}>Updated by: {t.invoice_updated_by}</Typography>
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
                                    </CardContent>
                                </Card>
                            ))}
							</Stack>
						)}
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
