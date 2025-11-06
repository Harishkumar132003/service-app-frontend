import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AdminLayout from '../../components/AdminLayout.jsx';
import { listTickets, assignTicket } from '../../api/tickets.js';
import { createInvoice } from '../../api/invoices.js';
import { listUsersByRole } from '../../api/users.js';
import TicketDetails from '../../components/TicketDetails.jsx';
import { useNavigate } from 'react-router-dom';
import MetricsHeader from '../../components/admin/MetricsHeader.jsx';

export default function AdminDashboard() {
	const navigate = useNavigate();
  const [tickets, setTickets] = useState({ pending: [], assignable: [] });
  const [amountMap, setAmountMap] = useState({});
  const [assignMap, setAssignMap] = useState({});
  const [providers, setProviders] = useState([]);
  const [invoiceFileMap, setInvoiceFileMap] = useState({});
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  function openDetails(t) {
    setSelectedTicket(t);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setDetailsOpen(false);
    setSelectedTicket(null);
  }

  async function load() {
    const prov = await listUsersByRole('serviceprovider');
    setProviders(prov);
    // Fetch tickets by status - backend filtering
    const all = await listTickets({
      status: ['Submitted', 'Service Provider Assignment'],
    });
    const pending = all.filter((t) => t.status === 'Submitted');
    // Only show tickets that still need assignment (no assigned_provider yet)
    const assignable = all.filter(
      (t) => t.status === 'Service Provider Assignment' && !t.assigned_provider
    );
    // Also get Admin Review status
    //const adminReview = await listTickets({ status: 'Admin Review' })
    // Combine pending review tickets
    const allPending = [...pending];
    setTickets({ pending: allPending, assignable });
  }
  useEffect(() => {
    load();
  }, []);

  async function onCreateInvoice(t) {
    const amountStr = (amountMap[t.id] || '').toString();
    const hasAmount = amountStr.trim() !== '' && !isNaN(Number(amountStr));
    const amount = hasAmount ? Number(amountStr) : undefined;
    const imageFile = invoiceFileMap[t.id];
    if (!hasAmount && !imageFile) return;
    await createInvoice(t.id, { amount, imageFile });
    await load();
  }

  async function onAssign(t) {
    const email = (assignMap[t.id] || '').trim().toLowerCase();
    if (!email) return;
    await assignTicket(t.id, email);
    await load();
  }

  return (
    <AdminLayout title='Dashboard'>
      <Container maxWidth='lg'>
        <Stack spacing={1.5}>
          <MetricsHeader onDrillDown={() => navigate('/admin/history')} />
          {/* <Stack direction='row' justifyContent='flex-end'>
            <Button
              variant='text'
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                navigate('/admin/history');
              }}
            >
              View Full Details
            </Button>
          </Stack> */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>Pending Review</Typography>
              <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                {(tickets.pending || []).length === 0 && (
                  <Typography variant='body2' color='text.secondary'>No data available</Typography>
                )}
                {(tickets.pending || []).map((t) => (
                  <Card key={t.id} >
                    <CardContent>
                      <Typography sx={{ fontWeight: 600 }} onClick={() => openDetails(t)}>
                        {t.category} - {t.status}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {t.description}
                      </Typography>
                      <Stack spacing={1.5} sx={{ mt: 1 }}>
                        <TextField
                          label='Amount'
                          size='small'
                          type='number'
                          fullWidth
                          value={amountMap[t.id] ?? ''}
                          onChange={(e) =>
                            setAmountMap((prev) => ({
                              ...prev,
                              [t.id]: e.target.value,
                            }))
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>₹</InputAdornment>
                            ),
                          }}
                        />

                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Button variant='outlined' component='label' size='small'>
                            {invoiceFileMap[t.id]
                              ? 'Change Image'
                              : 'Upload Invoice Image'}
                            <input
                              type='file'
                              hidden
                              accept='image/*'
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                setInvoiceFileMap((v) => ({ ...v, [t.id]: f }));
                              }}
                            />
                          </Button>

                          {invoiceFileMap[t.id] && (
                            <Chip
                              label={invoiceFileMap[t.id].name}
                              size='small'
                              onDelete={() =>
                                setInvoiceFileMap((v) => ({
                                  ...v,
                                  [t.id]: undefined,
                                }))
                              }
                            />
                          )}

                          <Button
                            variant='contained'
                            size='small'
                            onClick={() => onCreateInvoice(t)}
                            disabled={
                              !(
                                (amountMap[t.id] || '').trim() || invoiceFileMap[t.id]
                              )
                            }
                          >
                            Create
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>Assign to Provider</Typography>
              <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                {(tickets.assignable || []).length === 0 && (
                  <Typography variant='body2' color='text.secondary'>No data available</Typography>
                )}
                {(tickets.assignable || []).map((t) => (
                  <Card key={t.id}>
                    <CardContent>
                      <Typography sx={{ fontWeight: 600 }} onClick={() => openDetails(t)}>
                        {t.category} - {t.status}
                      </Typography>
                      <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                        <TextField
                          size='small'
                          select
                          placeholder='Select provider'
                          value={assignMap[t.id] || ''}
                          onChange={(e) =>
                            setAssignMap((v) => ({ ...v, [t.id]: e.target.value }))
                          }
                          sx={{ flex: 1 }}
                        >
                          {providers.map((p) => (
                            <MenuItem key={p.email} value={p.email}>
                              {p.email}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssign(t);
                          }}
                        >
                          Assign
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Stack>
        <TicketDetails
          open={detailsOpen}
          onClose={closeDetails}
          ticket={selectedTicket}
        />
      </Container>
    </AdminLayout>
  );
}
