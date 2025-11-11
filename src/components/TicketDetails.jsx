import { Dialog, DialogTitle, DialogContent, Stack, Typography, Box, Chip, Divider } from '@mui/material'
import dayjs from 'dayjs'
import BusinessIcon from '@mui/icons-material/Business'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default function TicketDetails({ open, onClose, ticket }) {
  if (!ticket) return null
  const imageUrl = ticket.initial_image_id ? `${API_BASE}/tickets/images/${ticket.initial_image_id}` : null
  const pr = (ticket.priority || 'medium')
  const createdAt = ticket.created_at ? dayjs.unix(ticket.created_at) : null
  const companyName = ticket.company?.name || null
  const createdByName = ticket?.created_by_user?.name || null
  const assignedProvider = ticket?.assigned_provider || null
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Ticket Details</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{ticket.category}</Typography>
            <Stack direction='row' spacing={1} alignItems='center' sx={{ mt: 0.5, flexWrap: 'wrap' }}>
              <Chip size='small' variant='outlined' label={ticket.status} />
              <Chip size='small' label={pr.charAt(0).toUpperCase() + pr.slice(1)} sx={{ bgcolor: (pr==='urgent'?'#fee2e2': (pr==='low'?'#f1f5f9':'#dbeafe')), color: (pr==='urgent'?'#ef4444': (pr==='low'?'#475569':'#1e40af')) }} />
            </Stack>
          </Box>

          <Stack spacing={0.5}>
            {companyName && (
              <Stack direction='row' spacing={1} alignItems='center'>
                <BusinessIcon sx={{ fontSize: 16, color: '#64748b' }} />
                <Typography variant='body2' color='text.secondary'>{companyName}</Typography>
              </Stack>
            )}
            {createdAt && (
              <Stack direction='row' spacing={1} alignItems='center'>
                <AccessTimeIcon sx={{ fontSize: 16, color: '#64748b' }} />
                <Typography variant='body2' color='text.secondary'>{createdAt.format('MMM D, YYYY h:mm A')}</Typography>
              </Stack>
            )}
            {createdByName && (
              <Stack direction='row' spacing={1} alignItems='center'>
                <PersonIcon sx={{ fontSize: 16, color: '#64748b' }} />
                <Typography variant='body2' color='text.secondary'>Created by: {createdByName}</Typography>
              </Stack>
            )}
            {assignedProvider && (
              <Typography variant='body2' color='text.secondary'>Assigned: {assignedProvider}</Typography>
            )}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Typography variant='subtitle2' color='text.secondary'>Description</Typography>
          <Typography variant='body2'>{ticket.description}</Typography>

          {imageUrl && (
            <Box sx={{ mt: 1 }}>
              <img src={imageUrl} alt='ticket' style={{ maxWidth: '100%', borderRadius: 8 }} />
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
