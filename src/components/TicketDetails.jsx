import { Dialog, DialogTitle, DialogContent, Stack, Typography, Box } from '@mui/material'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default function TicketDetails({ open, onClose, ticket }) {
  if (!ticket) return null
  const imageUrl = ticket.initial_image_id ? `${API_BASE}/tickets/images/${ticket.initial_image_id}` : null
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Ticket Details</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          <Typography variant='body1' sx={{ fontWeight: 600 }}>{ticket.category} - {ticket.status}</Typography>
          <Typography variant='body2'>Description: {ticket.description}</Typography>
          <Typography variant='body2'>Created By: {ticket.created_by}</Typography>
          {imageUrl && (
            <Box sx={{ mt: 1 }}>
              <img src={imageUrl} alt='ticket' style={{ maxWidth: '100%', borderRadius: 4 }} />
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
