import { AppBar, Toolbar, IconButton, MenuItem, Stack, TextField, Typography ,Container, Card, CardContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listTickets } from '../../api/tickets.js'
import TicketDetails from '../../components/TicketDetails.jsx'

const ViewAdminHistory = () => {
  const role = window.location.pathname.includes('/manager/history') ? 'manager' : 'admin';
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Completed');
  const [tickets, setTickets] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  
  async function load(){
    // Backend accepts comma-separated statuses; we pass a single status value here
    const t = await listTickets({ status: filter })
    setTickets(t)
  }

  useEffect(()=>{ load() }, [filter])
  

  return (
    <div>
      <AppBar position="sticky" color="primary" enableColorOnDark>
        <Toolbar sx={{ minHeight: 56 }}>
          <IconButton edge="start" color="inherit" aria-label="back" onClick={()=>navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant='h6' sx={{ ml: 1, fontWeight: 600, flex: 1 }}>
            {role == 'manager' ? 'Manager History' : 'Admin History'}
          </Typography>
        </Toolbar>
      </AppBar>
            <Container maxWidth='sm' sx={{ py: 2 }}>
      
      {/* History filter */}
      <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
        <TextField
          select
          size='small'
          label='Filter'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {role !== 'manager' && (
            <>
              <MenuItem value='Manager Approval'>Wait For Approval</MenuItem>
              <MenuItem value='Admin Review'>Decline</MenuItem>
            </>
          )}
          <MenuItem value='Work Completion'>To Verify (Work Submitted)</MenuItem>
          <MenuItem value='Member Verification'>Verified by Member</MenuItem>
           <MenuItem value='Accountant Processing'>Payment Processing</MenuItem>
          <MenuItem value='Completed'>Completed</MenuItem>
        </TextField>
      </Stack>
      <Stack spacing={1.5}>
        {tickets.map((t) => (
          <Card key={t.id} onClick={()=>{ setSelectedTicket(t); setDetailsOpen(true) }} sx={{ cursor: 'pointer' }}>
            <CardContent>
              <Typography sx={{ fontWeight: 600 }}>
                {t.category} - {t.status}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {t.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <TicketDetails open={detailsOpen} onClose={()=>{ setDetailsOpen(false); setSelectedTicket(null) }} ticket={selectedTicket} />
      </Container >
    </div>
  );
};

export default ViewAdminHistory;
