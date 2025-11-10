import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  InsertDriveFile as FileIcon,
   Build as BuildIcon
} from '@mui/icons-material';
import AccountantLayout from '../../components/AccountantLayout.jsx';
import { listTickets } from '../../api/tickets.js';
import { markPaid } from '../../api/invoices.js';
import { useNavigate } from 'react-router-dom';

// Category emoji mapping
const categoryEmojis = {
  bathroom: '🚽',
  light: '💡',
  fan: '🌀',
  ac: '❄️',
  furniture: '🪑',
  cleaning: '🧹',
  electrical: '⚡',
  plumbing: '🔧',
  default: '📋',
};

export default function AccountantDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [paymentFileMap, setPaymentFileMap] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load() {
    setTickets(await listTickets({ status: 'Accountant Processing' }));
  }

  useEffect(() => {
    load();
  }, []);

  function openConfirm(t) {
    setSelected(t);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    setConfirmOpen(false);
    setSelected(null);
  }

  async function onPaid() {
    if (!selected || !selected.invoice_id) return;
    const file = paymentFileMap[selected.id];
    await markPaid(selected.invoice_id, file);
    closeConfirm();
    await load();
  }

  const getCategoryEmoji = (cat) => {
    const lowerCat = cat?.toLowerCase() || '';
    return categoryEmojis[lowerCat] || categoryEmojis.default;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const readyForPayment = tickets.filter((t) => t.invoice_id);

  return (
    <AccountantLayout title='Dashboard'>
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 4 }}>
        {/* Header Stats */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            py: 4,
            px: 3,
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -30,
              right: -30,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}
          >
            {readyForPayment.length}
          </Typography>
          <Typography sx={{ color: 'white', opacity: 0.9, fontSize: 14 }}>
            {readyForPayment.length === 1 ? 'Payment' : 'Payments'} Ready to Process
          </Typography>
        </Box>

        <Container maxWidth="lg">
          {/* Section Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
              Pending Payments
            </Typography>
            {readyForPayment.length > 0 && (
              <Chip
                label={readyForPayment.length}
                sx={{
                  bgcolor: '#ef4444',
                  color: 'white',
                  fontWeight: 600,
                  height: 28,
                }}
              />
            )}
          </Box>

          {/* Empty State */}
          {readyForPayment.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 8,
                borderRadius: 5,
                border: '2px dashed #e2e8f0',
                textAlign: 'center',
                bgcolor: 'white',
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <Typography sx={{ fontSize: 40 }}>✅</Typography>
              </Box>
              <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#64748b', mb: 1 }}>
                All Caught Up!
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>
                No pending payments at the moment
              </Typography>
            </Paper>
          )}

          {/* Payment Cards */}
          <Stack spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 0.5 }}>
            {readyForPayment.map((t) => (
              <Paper
                key={t.id}
                elevation={0}
                sx={{
                  borderRadius: 5,
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
                    borderColor: '#10b981',
                  },
                }}
              >
                {/* Card Header */}
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    {/* Category Icon */}
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3.5,
                        bgcolor: '#fef3c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        flexShrink: 0,
                      }}
                    >
                      <BuildIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
                    </Box>

                    {/* Title and Badge */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 17,
                          fontWeight: 600,
                          color: '#1e293b',
                          mb: 1,
                        }}
                      >
                        {t.category}
                      </Typography>
                      <Chip
                        icon={<CheckIcon sx={{ fontSize: 14 }} />}
                        label="Ready for Payment"
                        size="small"
                        sx={{
                          bgcolor: '#dcfce7',
                          color: '#065f46',
                          fontWeight: 600,
                          height: 26,
                          fontSize: 11,
                          '& .MuiChip-icon': {
                            color: '#10b981',
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Details Grid */}
                  <Stack spacing={1.5}>
                    {/* Amount */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          bgcolor: '#f0fdf4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MoneyIcon sx={{ fontSize: 18, color: '#10b981' }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                          AMOUNT
                        </Typography>
                        <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                          ${t.invoice_amount || '0.00'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Created By */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          bgcolor: '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                          CREATED BY
                        </Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>
                          {t.created_by_user?.name || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Invoice ID */}
                    {t.invoice_id && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            bgcolor: '#fef3c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FileIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                        </Box>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                            INVOICE NUMBER
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#1e293b',
                                fontFamily: 'monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {t.invoice_id}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(t.invoice_id)}
                              sx={{ p: 0.5 }}
                            >
                              <CopyIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Payment File Upload */}
                    {paymentFileMap[t.id] && (
                      <Alert
                        icon={<CheckIcon />}
                        severity="success"
                        sx={{ borderRadius: 2 }}
                      >
                        Payment proof attached: {paymentFileMap[t.id]?.name}
                      </Alert>
                    )}
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    p: 2.5,
                    pt: 0,
                  }}
                >
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<CameraIcon />}
                    sx={{
                      height: 44,
                      borderRadius: 5.5,
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: 13,
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#cbd5e0',
                        bgcolor: '#f8fafc',
                      },
                    }}
                  >
                    {paymentFileMap[t.id]?.name || 'Upload Proof'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setPaymentFileMap((v) => ({ ...v, [t.id]: f }));
                      }}
                    />
                  </Button>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => openConfirm(t)}
                    startIcon={<CheckIcon />}
                    sx={{
                      height: 44,
                      borderRadius: 5.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: 13,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                      },
                    }}
                  >
                    Mark Paid
                  </Button>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={closeConfirm}
        PaperProps={{
          sx: { borderRadius: 4, p: 1, minWidth: 320 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          Confirm Payment
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to mark this invoice as paid?
          </Typography>
          {selected && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#64748b', mb: 1 }}>
                Invoice Details
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#1e293b', mb: 0.5 }}>
                Category: <strong>{selected.category}</strong>
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#1e293b', mb: 0.5 }}>
                Amount: <strong>${selected.invoice_amount}</strong>
              </Typography>
              {paymentFileMap[selected.id] && (
                <Chip
                  icon={<CheckIcon sx={{ fontSize: 14 }} />}
                  label={`With proof: ${paymentFileMap[selected.id]?.name}`}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: '#dcfce7',
                    color: '#065f46',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={closeConfirm}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 500,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onPaid}
            variant="contained"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
            }}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </AccountantLayout>
  );
}