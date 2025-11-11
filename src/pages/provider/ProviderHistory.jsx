import { useEffect, useState } from 'react';
import { Box, Button, Container, Paper, Stack, Typography, Chip, IconButton, Dialog, DialogTitle, DialogContent, Divider } from '@mui/material';
import { listTickets } from '../../api/tickets.js';
import axios from 'axios';
import {
  Build as BuildIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Image as ImageIcon,
} from '@mui/icons-material';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
function authHeader() {
  const t = localStorage.getItem('serviceapp_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function ProviderHistory() {
  const [tickets, setTickets] = useState([]);
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  async function load() {
    const t = await listTickets({ status: ['Completed','Accountant Processing'] });
    setTickets(t || []);
  }

  useEffect(() => { load(); }, []);

  const formatTimeAgo = (ts) => {
    if (!ts) return 'Recently';
    const now = Math.floor(Date.now()/1000);
    const diff = now - ts;
    if (diff < 3600) {
      const m = Math.max(1, Math.floor(diff/60));
      return `${m} ${m===1?'min':'mins'} ago`;
    }
    if (diff < 86400) {
      const h = Math.floor(diff/3600);
      return `${h} ${h===1?'hour':'hours'} ago`;
    }
    const d = Math.floor(diff/86400);
    return `${d} ${d===1?'day':'days'} ago`;
  };

  async function onViewImages(t) {
    const ids = t.completion_image_ids || [];
    if (!ids.length) return;
    try {
      const blobs = await Promise.all(ids.map((id) => axios.get(`${API_BASE}/tickets/images/${id}`, { responseType: 'blob', headers: { ...authHeader() } }).then(r => r.data)));
      const urls = blobs.map((b) => URL.createObjectURL(b));
      setImageUrls(urls);
      setImageOpen(true);
    } catch (e) {
      // ignore
    }
  }

  function closeImages() {
    imageUrls.forEach((u) => URL.revokeObjectURL(u));
    setImageUrls([]);
    setImageOpen(false);
  }

  const completedCount = tickets.length;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 4 }}>
      {/* Header */}
      <Box sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #0c70a6 100%)', py: 3, px: 2, color: 'white', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>History</Typography>
      </Box>

      <Container maxWidth="sm">
        {/* Section Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
            Completed Work
          </Typography>
          {completedCount > 0 && (
            <Chip label={completedCount} sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600, height: 28 }} />
          )}
        </Box>

        {/* Empty State */}
        {completedCount === 0 && (
          <Paper elevation={0} sx={{ p: 8, borderRadius: 5, border: '2px dashed #e2e8f0', textAlign: 'center', bgcolor: 'white' }}>
            <Typography sx={{ fontSize: 40 }}>📘</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#64748b', mt: 1 }}>
              No history yet
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#94a3b8' }}>
              Completed work will appear here
            </Typography>
          </Paper>
        )}

        {/* History Cards */}
        <Stack spacing={2}>
          {tickets.map((t) => (
            <Paper key={t.id} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BuildIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>TICKET #{t.id.slice(-4)}</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{`${(t.category || '').charAt(0).toUpperCase()}${(t.category||'').slice(1)} - Completed`}</Typography>
                  </Box>
                </Stack>
              </Box>
              <Box sx={{ p: 2 }}>
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                    <Typography sx={{ fontSize: 14, color: '#1e293b' }}>{t.company?.name || 'Company'}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip size="small" label={(t.priority || 'medium').charAt(0).toUpperCase() + (t.priority || 'medium').slice(1)} sx={{ bgcolor: (t.priority==='urgent'?'#fee2e2': (t.priority==='low'?'#f1f5f9':'#dbeafe')), color: (t.priority==='urgent'?'#ef4444': (t.priority==='low'?'#475569':'#1e40af')), fontWeight: 600 }} />
                    <Chip size="small" label="Completed" sx={{ bgcolor: '#dcfce7', color: '#065f46', fontWeight: 600 }} />
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#64748b' }}>
                      <TimeIcon sx={{ fontSize: 16 }} />
                      <Typography sx={{ fontSize: 12 }}>{formatTimeAgo(t.created_at)}</Typography>
                    </Stack>
                  </Stack>
                  {!!(t.completion_image_ids?.length) && (
                    <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => onViewImages(t)} sx={{ borderRadius: 3 }}>
                      View Images
                    </Button>
                  )}
                </Stack>
              </Box>
            </Paper>
          ))}
        </Stack>

        {/* Images Dialog */}
        <Dialog open={imageOpen} onClose={closeImages} fullWidth maxWidth="sm">
          <DialogTitle>Completion Images</DialogTitle>
          <DialogContent>
            <Stack spacing={1}>
              {imageUrls.map((u, idx) => (
                <img key={idx} src={u} alt={`completion-${idx}`} style={{ width: '100%', borderRadius: 8 }} />
              ))}
            </Stack>
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
