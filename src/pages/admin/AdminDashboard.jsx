import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Chip,
  Stack,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  InputAdornment,
  MenuItem,
  Alert,
  IconButton,
  Badge,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  CameraAlt as CameraIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
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
  const [onsiteOnlyMap, setOnsiteOnlyMap] = useState({});

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
    const all = await listTickets({
      status: ['Submitted', 'Service Provider Assignment'],
    });
    const pending = all.filter((t) => t.status === 'Submitted');
    const assignable = all.filter(
      (t) => t.status === 'Service Provider Assignment' && !t.assigned_provider
    );
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

  const getPriorityConfig = (priority) => {
    const p = priority || 'medium';
    const configs = {
      urgent: { color: '#fee2e2', textColor: '#ef4444', label: 'Urgent' },
      high: { color: '#fed7aa', textColor: '#ea580c', label: 'High' },
      medium: { color: '#dbeafe', textColor: '#1e40af', label: 'Medium' },
      low: { color: '#f1f5f9', textColor: '#475569', label: 'Low' },
    };
    return configs[p] || configs.medium;
  };

  const pendingFiltered = selectedCompanyId
    ? (tickets.pending || []).filter((t) => t.company_id === selectedCompanyId)
    : tickets.pending || [];
  const assignableFiltered = selectedCompanyId
    ? (tickets.assignable || []).filter((t) => t.company_id === selectedCompanyId)
    : tickets.assignable || [];

  return (
    <AdminLayout title="Dashboard">
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            {/* Metrics Header */}
            <MetricsHeader onDrillDown={() => navigate('/admin/history')} />

            {/* Filter Section */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon sx={{ fontSize: 20, color: '#64748b' }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#64748b', letterSpacing: 0.3 }}>
                    FILTER BY COMPANY
                  </Typography>
                </Box>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (v) => {
                      if (!v) return 'All Companies';
                      const c = (companyList || []).find((x) => x.id === v);
                      return c?.name || 'Company';
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: 'white',
                    },
                  }}
                >
                  <MenuItem value="">All Companies</MenuItem>
                  {(companyList || []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                        {c.name || c.id}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                {selectedCompanyId && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelectedCompanyId('')}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      alignSelf: 'flex-start',
                    }}
                  >
                    Clear Filter
                  </Button>
                )}
              </Stack>
            </Paper>

            {/* Two Column Layout */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Pending Amount Assignments */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                    Pending Amount Assignments
                  </Typography>
                  <Badge badgeContent={pendingFiltered.length} color="error" />
                </Box>

                <Stack spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 0.5 }}>
                  {pendingFiltered.length === 0 && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 6,
                        borderRadius: 4,
                        border: '2px dashed #e2e8f0',
                        textAlign: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: 40, mb: 2 }}>📋</Typography>
                      <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                        No pending assignments
                      </Typography>
                    </Paper>
                  )}

                  {pendingFiltered.map((t) => {
                    const priorityConfig = getPriorityConfig(t.priority);
                    return (
                      <Paper
                        key={t.id}
                        elevation={0}
                        sx={{
                          borderRadius: 4,
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          '&:hover': {
                            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.15)',
                            borderColor: '#6366f1',
                          },
                        }}
                      >
                        {/* Card Header */}
                        <Box sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            {/* Category Icon */}
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 3,
                                bgcolor: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <BuildIcon sx={{ fontSize: 24, color: '#6366f1' }} />
                            </Box>

                            {/* Title and Badge */}
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: 15,
                                  fontWeight: 600,
                                  color: '#1e293b',
                                  textTransform: 'capitalize',
                                  mb: 0.5,
                                }}
                              >
                                {t.category} - {companyMap[t.company_id] || 'Unknown'}
                              </Typography>
                              <Chip
                                label={priorityConfig.label}
                                size="small"
                                sx={{
                                  bgcolor: priorityConfig.color,
                                  color: priorityConfig.textColor,
                                  fontWeight: 600,
                                  height: 22,
                                  fontSize: 11,
                                }}
                              />
                            </Box>

                            {/* More Button */}
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetails(t);
                              }}
                            >
                              <MoreIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Box>

                          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 2 }}>
                            {t.description}
                          </Typography>

                          <Divider sx={{ mb: 2 }} />

                          {/* Amount Input */}
                          <TextField
                            label="Amount"
                            size="small"
                            type="number"
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
                                <InputAdornment position="start">
                                  <MoneyIcon sx={{ fontSize: 18, color: '#10b981' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              mb: 2,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2.5,
                              },
                            }}
                          />

                          {/* File Upload */}
                          {invoiceFileMap[t.id] && (
                            <Alert
                              severity="success"
                              icon={<CameraIcon />}
                              onClose={() =>
                                setInvoiceFileMap((v) => ({
                                  ...v,
                                  [t.id]: undefined,
                                }))
                              }
                              sx={{ mb: 2, borderRadius: 2 }}
                            >
                              <Typography sx={{ fontSize: 12 }}>
                                {invoiceFileMap[t.id].name}
                              </Typography>
                            </Alert>
                          )}

                          {/* Action Buttons */}
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button
                              component="label"
                              variant="outlined"
                              fullWidth
                              startIcon={<CameraIcon />}
                              sx={{
                                textTransform: 'none',
                                borderRadius: 2.5,
                                fontWeight: 500,
                                fontSize: 13,
                              }}
                            >
                              {invoiceFileMap[t.id] ? 'Change' : 'Upload Invoice'}
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  setInvoiceFileMap((v) => ({ ...v, [t.id]: f }));
                                }}
                              />
                            </Button>

                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => onCreateInvoice(t)}
                              disabled={!(amountMap[t.id]?.trim() || invoiceFileMap[t.id])}
                              sx={{
                                textTransform: 'none',
                                borderRadius: 2.5,
                                fontWeight: 600,
                                fontSize: 13,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                },
                                '&:disabled': {
                                  background: '#e2e8f0',
                                  color: '#94a3b8',
                                },
                              }}
                            >
                              Create
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>

              {/* Assign to Provider */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                    Assign to Provider
                  </Typography>
                  <Badge badgeContent={assignableFiltered.length} color="warning" />
                </Box>

                <Stack spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 0.5 }}>
                  {assignableFiltered.length === 0 && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 6,
                        borderRadius: 4,
                        border: '2px dashed #e2e8f0',
                        textAlign: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: 40, mb: 2 }}>👷</Typography>
                      <Typography sx={{ fontSize: 13, color: '#64748b' }}>
                        No pending assignments
                      </Typography>
                    </Paper>
                  )}

                  {assignableFiltered.map((t) => {
                    const priorityConfig = getPriorityConfig(t.priority);
                    const onsiteProviders = onsiteOnlyMap[t.id]
                      ? providers.filter((p) => p.onsite_company_id === t.company_id)
                      : providers;

                    return (
                      <Paper
                        key={t.id}
                        elevation={0}
                        sx={{
                          borderRadius: 4,
                          border: '1px solid #e2e8f0',
                          overflow: 'hidden',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          '&:hover': {
                            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)',
                            borderColor: '#f59e0b',
                          },
                        }}
                      >
                        <Box sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            {/* Category Icon */}
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 3,
                                bgcolor: '#fef3c7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <BuildIcon sx={{ fontSize: 24, color: '#f59e0b' }} />
                            </Box>

                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: 15,
                                  fontWeight: 600,
                                  color: '#1e293b',
                                  textTransform: 'capitalize',
                                  mb: 0.5,
                                }}
                              >
                                {t.category} - {companyMap[t.company_id] || 'Unknown'}
                              </Typography>
                              <Chip
                                label={priorityConfig.label}
                                size="small"
                                sx={{
                                  bgcolor: priorityConfig.color,
                                  color: priorityConfig.textColor,
                                  fontWeight: 600,
                                  height: 22,
                                  fontSize: 11,
                                }}
                              />
                            </Box>

                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetails(t);
                              }}
                            >
                              <MoreIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          </Box>

                          <Typography sx={{ fontSize: 13, color: '#64748b', mb: 2 }}>
                            {t.description}
                          </Typography>

                          <Divider sx={{ mb: 2 }} />

                          {/* On-site Toggle */}
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={!!onsiteOnlyMap[t.id]}
                                onChange={(e) =>
                                  setOnsiteOnlyMap((v) => ({ ...v, [t.id]: e.target.checked }))
                                }
                              />
                            }
                            label="On-site only"
                            sx={{
                              mb: 2,
                              '& .MuiFormControlLabel-label': {
                                fontSize: 13,
                                color: '#64748b',
                                fontWeight: 500,
                              },
                            }}
                          />

                          {/* Provider Selection */}
                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <TextField
                              size="small"
                              select
                              fullWidth
                              placeholder="Select provider"
                              value={assignMap[t.id] || ''}
                              onChange={(e) =>
                                setAssignMap((v) => ({ ...v, [t.id]: e.target.value }))
                              }
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2.5,
                                },
                              }}
                            >
                              {onsiteProviders.length === 0 ? (
                                <MenuItem disabled value="">
                                  No on-site providers
                                </MenuItem>
                              ) : (
                                onsiteProviders.map((p) => (
                                  <MenuItem key={p.email} value={p.email}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <PersonIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                                      {p.name || p.email}
                                    </Box>
                                  </MenuItem>
                                ))
                              )}
                            </TextField>

                            <Button
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAssign(t);
                              }}
                              disabled={!assignMap[t.id]}
                              sx={{
                                textTransform: 'none',
                                borderRadius: 2.5,
                                fontWeight: 600,
                                fontSize: 13,
                                minWidth: 100,
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                                },
                                '&:disabled': {
                                  background: '#e2e8f0',
                                  color: '#94a3b8',
                                },
                              }}
                            >
                              Assign
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            </Box>
          </Stack>

          <TicketDetails open={detailsOpen} onClose={closeDetails} ticket={selectedTicket} />
        </Container>
      </Box>
    </AdminLayout>
  );
}