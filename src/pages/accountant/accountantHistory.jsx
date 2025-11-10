import { Box, Button, Container, Stack, Typography, Dialog, DialogTitle, DialogContent, Paper, Chip, IconButton, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountantLayout from '../../components/AccountantLayout.jsx';
import { listTickets } from '../../api/tickets.js'
import { fetchInvoiceImageBlob } from '../../api/invoices.js'
import TicketDetails from '../../components/TicketDetails.jsx'
import {
  CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  InsertDriveFile as FileIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

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

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
    };

    const paidCount = tickets.length;

    return (
      <AccountantLayout title='History'>
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
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
              {paidCount}
            </Typography>
            <Typography sx={{ color: 'white', opacity: 0.9, fontSize: 14 }}>
              {paidCount === 1 ? 'Payment Completed' : 'Payments Completed'}
            </Typography>
          </Box>

          <Container maxWidth='lg'>
            {/* Section Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
                Payment History
              </Typography>
              {paidCount > 0 && (
                <Chip
                  label={paidCount}
                  sx={{
                    bgcolor: '#10b981',
                    color: 'white',
                    fontWeight: 600,
                    height: 28,
                  }}
                />
              )}
            </Box>

            {/* Empty State */}
            {paidCount === 0 && (
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
                  <Typography sx={{ fontSize: 40 }}>📘</Typography>
                </Box>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#64748b', mb: 1 }}>
                  No history yet
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>
                  Completed payments will appear here
                </Typography>
              </Paper>
            )}

            {/* History Cards */}
            <Stack spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 0.5 }}>
              {tickets.map((t) => (
                <Paper
                  key={t.id}
                  elevation={0}
                  onClick={()=>{ setSelectedTicket(t); setDetailsOpen(true) }}
                  sx={{
                    borderRadius: 5,
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
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
                        <Typography sx={{ fontSize: 17, fontWeight: 600, color: '#1e293b', mb: 1 }}>
                          {t.category}
                        </Typography>
                        <Chip
                          icon={<CheckIcon sx={{ fontSize: 14 }} />}
                          label="Paid"
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
                            ${typeof t.invoice_amount === 'number' ? t.invoice_amount.toFixed(2) : (t.invoice_amount ?? '0.00')}
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
                              <IconButton size="small" onClick={() => copyToClipboard(t.invoice_id)} sx={{ p: 0.5 }}>
                                <CopyIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {/* Processed Time */}
                      {t.invoice_processed_at && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box>
                            <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                              PROCESSED AT
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: '#1e293b' }}>
                              {new Date(t.invoice_processed_at * 1000).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Box>

                  {/* Action Row */}
                  {t.invoice_has_image && (
                    <Box sx={{ display: 'flex', gap: 1.5, p: 2.5, pt: 0 }}>
                      <Button
                        variant="outlined"
                        onClick={async (e)=>{
                          e.stopPropagation();
                          if (!t.invoice_id) return;
                          try {
                            const blob = await fetchInvoiceImageBlob(t.invoice_id)
                            const url = URL.createObjectURL(blob)
                            setImageUrl(url)
                            setImageOpen(true)
                          } catch {}
                        }}
                        sx={{
                          height: 40,
                          borderRadius: 4,
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: 13,
                          borderColor: '#e2e8f0',
                          color: '#64748b',
                          '&:hover': { borderColor: '#cbd5e0', bgcolor: '#f8fafc' },
                        }}
                      >
                        View Invoice Image
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))}
            </Stack>

            {/* Modals */}
            <TicketDetails open={detailsOpen} onClose={()=>{ setDetailsOpen(false); setSelectedTicket(null) }} ticket={selectedTicket} />
            <Dialog open={imageOpen} onClose={()=>{ setImageOpen(false); if (imageUrl){ URL.revokeObjectURL(imageUrl); setImageUrl('') } }} fullWidth maxWidth='sm'>
              <DialogTitle>Invoice Image</DialogTitle>
              <DialogContent>
                {imageUrl && (<img src={imageUrl} alt='invoice' style={{ maxWidth: '100%', borderRadius: 4 }} />)}
              </DialogContent>
            </Dialog>
          </Container>
        </Box>
      </AccountantLayout>
    );
}

export default AccountantHistory