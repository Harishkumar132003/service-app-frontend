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
import { listCompanies } from '../../api/companies.js';
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
  const [companyMap, setCompanyMap] = useState({});
  const [companyList, setCompanyList] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  function openDetails(t) {
    setSelectedTicket(t);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setDetailsOpen(false);
    setSelectedTicket(null);
  }

  async function load() {
    const companies = await listCompanies();
    setCompanyList(companies || []);
    const cmap = Object.fromEntries((companies || []).map((c) => [c.id, c.name]));
    setCompanyMap(cmap);
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
          {/* Filters */}
          <Box sx={{
            p: 1.5,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <Stack  spacing={1.5} alignItems='center' >
              <Typography sx={{ fontWeight: 400, color: '#0f172a' }}>Filter By Company</Typography>
              <TextField
                select
                size='small'
                value={selectedCompanyId}
                onChange={(e)=> setSelectedCompanyId(e.target.value)}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (v) => {
                    if (!v) return 'All Companies'
                    const c = (companyList || []).find(x => x.id === v)
                    return c?.name || 'Company'
                  }
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ width:'100%',minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'white' } }}
                label='Company'
              >
                <MenuItem value=''>All Companies</MenuItem>
                {(companyList||[]).map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name || c.id}</MenuItem>
                ))}
              </TextField>
              {selectedCompanyId && (
                <Button size='small' variant='text' onClick={()=> setSelectedCompanyId('')} sx={{ textTransform: 'none' }}>Clear</Button>
              )}
            </Stack>
          </Box>
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
          {(() => {
            const pendingFiltered = selectedCompanyId ? (tickets.pending || []).filter(t => t.company_id === selectedCompanyId) : (tickets.pending || []);
            const assignableFiltered = selectedCompanyId ? (tickets.assignable || []).filter(t => t.company_id === selectedCompanyId) : (tickets.assignable || []);
            return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} pl='0px !important'>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>Pending Review</Typography>
              <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 ,gap:2,display:'flex',flexDirection:'column'}}>
                {pendingFiltered.length === 0 && (
                  <Typography variant='body2' color='text.secondary'>No data available</Typography>
                )}
                {pendingFiltered.map((t) => (
                  <Card key={t.id} sx={{ borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', border: '1px solid', borderColor: 'divider',overflow:'unset' }}>
                    <CardContent>
                      <Stack direction='row' alignItems='center' justifyContent='space-between'>
                        <Stack direction='row' spacing={1.25} alignItems='center'>
                          <Box>
                            <Typography sx={{ fontWeight: 700,textTransform:'capitalize' }}>{`${t.category}-${companyMap[t.company_id] || 'Unknown'}`}</Typography>
                            <Chip size='small' label={(t.priority||'medium').charAt(0).toUpperCase() + (t.priority||'medium').slice(1)} sx={{ ml: .5, mt: .5, bgcolor: (t.priority==='urgent'?'#fee2e2': (t.priority==='low'?'#f1f5f9':'#dbeafe')), color: (t.priority==='urgent'?'#ef4444': (t.priority==='low'?'#475569':'#1e40af')) }} />
                          </Box>
                        </Stack>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Button size='small' variant='text' onClick={(e)=>{ e.stopPropagation(); openDetails(t); }}>More</Button>
                        </Stack>
                      </Stack>
                      <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
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

            <Grid item xs={12} md={6} pl='0px !important'>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>Assign to Provider</Typography>
              <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1,gap:2,display:'flex',flexDirection:'column' }}>
                {assignableFiltered.length === 0 && (
                  <Typography variant='body2' color='text.secondary'>No data available</Typography>
                )}
                {assignableFiltered.map((t) => (
                  <Card key={t.id} sx={{ borderRadius: 3, boxShadow: '0 6px 20px rgba(0,0,0,0.08)', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent>
                      <Stack direction='row' alignItems='center' justifyContent='space-between'>
                        <Stack direction='row' spacing={1.25} alignItems='center'>
                          <Box>
                            <Typography sx={{ fontWeight: 700,textTransform:'capitalize' }}>{`${t.category}-${companyMap[t.company_id] || 'Unknown'}`}</Typography>
                            <Chip size='small' label={(t.priority||'medium').charAt(0).toUpperCase() + (t.priority||'medium').slice(1)} sx={{ ml: .5, mt: .5, bgcolor: (t.priority==='urgent'?'#fee2e2': (t.priority==='low'?'#f1f5f9':'#dbeafe')), color: (t.priority==='urgent'?'#ef4444': (t.priority==='low'?'#475569':'#1e40af')) }} />
                             <Typography  variant="subtitle2"color='text.secondary'>{t.description}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <Button size='small' variant='text' onClick={(e)=>{ e.stopPropagation(); openDetails(t); }}>More</Button>
                        </Stack>
                      </Stack>
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
            )
          })()}
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
