import { Stack, Typography ,Container, Card, CardContent, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountantLayout from '../../components/AccountantLayout.jsx';
import { listTickets } from '../../api/tickets.js'
import { fetchInvoiceImageBlob } from '../../api/invoices.js'
import TicketDetails from '../../components/TicketDetails.jsx'

const AccountantHistory = () => {
     const navigate = useNavigate();
     const [tickets, setTickets] = useState([]);
     const [imageOpen, setImageOpen] = useState(false)
     const [imageUrl, setImageUrl] = useState('')
     const [detailsOpen, setDetailsOpen] = useState(false)
     const [selectedTicket, setSelectedTicket] = useState(null)
     
     async function load(){
       const t = await listTickets({ status: 'Completed' })
       setTickets(t)
     }
    
     useEffect(()=>{ load() }, [])
     
   
     return (
       <AccountantLayout title='History'>
         <Container maxWidth='lg'>
         
         {/* Showing only Completed items */}
         <Stack spacing={1.5}>
           {tickets.map((t) => (
             <Card key={t.id} onClick={()=>{ setSelectedTicket(t); setDetailsOpen(true) }} sx={{ cursor: 'pointer' }}>
               <CardContent>
                 <Typography sx={{ fontWeight: 600 }}>
                   {t.category} - {t.status}
                 </Typography>
                 <Typography variant='body2'>Amount: {typeof t.invoice_amount === 'number' ? t.invoice_amount.toFixed(2) : (t.invoice_amount ?? '-')}</Typography>
                 {t.invoice_processed_at && (
                   <Typography variant='caption' color='text.secondary'>Processed: {new Date(t.invoice_processed_at * 1000).toLocaleString()}</Typography>
                 )}
                 <Typography variant='body2' color='text.secondary'>
                   {t.description}
                 </Typography>
                 <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                   {t.invoice_has_image && (
                     <Button variant='text' size='small' onClick={async (e)=>{
                       e.stopPropagation();
                       if (!t.invoice_id) return;
                       try {
                         const blob = await fetchInvoiceImageBlob(t.invoice_id)
                         const url = URL.createObjectURL(blob)
                         setImageUrl(url)
                         setImageOpen(true)
                       } catch {}
                     }}>View Invoice Image</Button>
                   )}
                 </Stack>
               </CardContent>
             </Card>
           ))}
         </Stack>
         <TicketDetails open={detailsOpen} onClose={()=>{ setDetailsOpen(false); setSelectedTicket(null) }} ticket={selectedTicket} />
         <Dialog open={imageOpen} onClose={()=>{ setImageOpen(false); if (imageUrl){ URL.revokeObjectURL(imageUrl); setImageUrl('') } }} fullWidth maxWidth='sm'>
           <DialogTitle>Invoice Image</DialogTitle>
           <DialogContent>
             {imageUrl && (<img src={imageUrl} alt='invoice' style={{ maxWidth: '100%', borderRadius: 4 }} />)}
           </DialogContent>
         </Dialog>
       </Container>
     </AccountantLayout>
   );
}

export default AccountantHistory