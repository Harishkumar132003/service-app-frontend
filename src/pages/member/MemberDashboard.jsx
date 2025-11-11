import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Alert,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  CameraAlt as CameraIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as HourglassIcon,
  ArrowBack as BackIcon,
  History as HistoryIcon,
  Send as SendIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import AppBarTop from '../../components/AppBarTop.jsx';
import TicketDetails from '../../components/TicketDetails.jsx';
import { listTickets, createTicket, verifyTicket } from '../../api/tickets.js';
import { listCategories } from '../../api/categories.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

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

export default function MemberDashboard() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [category, setCategory] = useState('bathroom');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('verification');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  const filteredTickets = tickets.filter(t => {
    if (filter === 'completed') return t.status === 'Completed';
    if (filter === 'verification') return t.status === 'Work Completion';
    return t.status !== 'Completed' && t.status !== 'Work Completion';
  });

  async function load() {
    const t = await listTickets();
    setTickets(t);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const items = await listCategories();
        setCategories(items);
        if (items && items.length && !categoryId) {
          setCategoryId(items[0].id);
        }
      } catch (e) {
        // ignore, fallback to legacy categories
      }
    })();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    const usingCatalog = (categories && categories.length > 0);
    await createTicket({ 
      categoryId: usingCatalog ? categoryId : undefined, 
      category: usingCatalog ? undefined : category, 
      description, 
      priority,
      imageFile 
    });
    if (usingCatalog) {
      setCategoryId(categories[0]?.id || '');
    } else {
      setCategory('bathroom');
    }
    setDescription('');
    setImageFile(null);
    setPriority('medium');
    await load();
    setSubmitting(false);
  }

  async function onVerify(id) {
    await verifyTicket(id);
    await load();
  }

  function openVerifyConfirm(e, id) {
    e.stopPropagation();
    setVerifyingId(id);
    setConfirmOpen(true);
  }

  async function confirmVerify() {
    if (verifyingId) {
      await onVerify(verifyingId);
    }
    setConfirmOpen(false);
    setVerifyingId(null);
  }

  function cancelVerify() {
    setConfirmOpen(false);
    setVerifyingId(null);
  }

  function openDetails(t) {
    setSelectedTicket(t);
    setDetailsOpen(true);
  }

  function closeDetails() {
    setDetailsOpen(false);
    setSelectedTicket(null);
  }

  const getStatusConfig = (status) => {
    const configs = {
      'Completed': { color: '#d1fae5', textColor: '#065f46', icon: <CheckIcon sx={{ fontSize: 14 }} />, label: 'Completed' },
      'Work Completion': { color: '#fef3c7', textColor: '#92400e', icon: <HourglassIcon sx={{ fontSize: 14 }} />, label: 'To Verify' },
      'Manager Approval': { color: '#dbeafe', textColor: '#1e40af', icon: <HourglassIcon sx={{ fontSize: 14 }} />, label: 'Awaiting Approval' },
      'Member Verification': { color: '#e0e7ff', textColor: '#4338ca', icon: <VerifiedIcon sx={{ fontSize: 14 }} />, label: 'Verified' },
    };
    return configs[status] || { color: '#f1f5f9', textColor: '#64748b', icon: <HourglassIcon sx={{ fontSize: 14 }} />, label: status };
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = dayjs.unix(timestamp);
    const now = dayjs();
    const diffDays = now.diff(date, 'day');
    
    if (diffDays === 0) {
      const diffHours = now.diff(date, 'hour');
      if (diffHours === 0) return 'Just now';
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.format('MMM D, YYYY');
    }
  };

  const getCategoryEmoji = (cat) => {
    const lowerCat = cat?.toLowerCase() || '';
    return categoryEmojis[lowerCat] || categoryEmojis.default;
  };

  const getCurrentCategory = () => {
    if (categories && categories.length) {
      return categories.find(c => c.id === categoryId);
    }
    return { name: category };
  };

  const verificationCount = tickets.filter(t => t.status === 'Work Completion').length;
  const inProgressCount = tickets.filter(t => t.status !== 'Completed' && t.status !== 'Work Completion').length;

  return (
    <Box sx={{ bgcolor: '#f8fafc', height: 'calc(100vh - 48px)',overflowY: 'auto' }}>
      {/* Header with Gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          height: 120,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center',  px: 2.5 }}>
         
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', flexGrow: 1 }}>
            My Tickets
          </Typography>
          <IconButton sx={{ color: 'white' }}>
            <HistoryIcon />
          </IconButton>
        </Box>
        <Typography sx={{ color: 'white', opacity: 0.9, fontSize: 13, px: 2.5, mt: 1 }}>
          Create and track your service requests
        </Typography>
      </Box>

      <Container maxWidth="sm" sx={{  pb: 10 }}>
        {/* Tab Bar */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3,mt:3 }}>
          <Chip
            label="New Ticket"
            onClick={() => setCurrentTab(0)}
            sx={{
              height: 40,
              borderRadius: 5,
              fontWeight: 600,
              fontSize: 14,
              bgcolor: currentTab === 0 ? 'white' : 'rgba(255,255,255,0.5)',
              color: currentTab === 0 ? '#0284c7' : '#64748b',
              boxShadow: currentTab === 0 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              '&:hover': {
                bgcolor: currentTab === 0 ? 'white' : 'rgba(255,255,255,0.7)',
              },
            }}
          />
          <Badge badgeContent={verificationCount} color="error">
            <Chip
              label="My Requests"
              onClick={() => setCurrentTab(1)}
              sx={{
                height: 40,
                borderRadius: 5,
                fontWeight: 600,
                fontSize: 14,
                bgcolor: currentTab === 1 ? 'white' : 'rgba(255,255,255,0.5)',
                color: currentTab === 1 ? '#0284c7' : '#64748b',
                boxShadow: currentTab === 1 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                '&:hover': {
                  bgcolor: currentTab === 1 ? 'white' : 'rgba(255,255,255,0.7)',
                },
              }}
            />
          </Badge>
        </Box>

        {/* New Ticket Form */}
        {currentTab === 0 && (
          <Box component="form" onSubmit={onCreate}>
            {/* Category Section */}
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#64748b', mb: 1.5, letterSpacing: 0.5 }}>
              CATEGORY
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                mb: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <TextField
                select
                fullWidth
                value={(categories && categories.length) ? categoryId : category}
                onChange={(e) => {
                  if (categories && categories.length) setCategoryId(e.target.value);
                  else setCategory(e.target.value);
                }}
                SelectProps={{
                  renderValue: (value) => {
                    const cat = getCurrentCategory();
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        
                        <Typography sx={{ fontWeight: 500, fontSize: 15 }}>
                          {cat?.name || 'Select Category'}
                        </Typography>
                      </Box>
                    );
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' },
                  },
                }}
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {c.name}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Paper>

            {/* Priority Section */}
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#64748b', mb: 1.5, letterSpacing: 0.5 }}>
              PRIORITY
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                mb: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <TextField
                select
                fullWidth
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                SelectProps={{
                  renderValue: (value) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: 15 }}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                      </Typography>
                    </Box>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' },
                  },
                }}
              >
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </TextField>
            </Paper>

            {/* Description Section */}
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#64748b', mb: 1.5, letterSpacing: 0.5 }}>
              DESCRIPTION
            </Typography>
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Describe the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
              <Box sx={{ px: 2, pb: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography sx={{ fontSize: 11, color: '#cbd5e0' }}>
                  {description.length}/500
                </Typography>
              </Box>
            </Paper>

            {/* Attach Image Button */}
            <Button
              component="label"
              fullWidth
              variant="outlined"
              sx={{
                height: 52,
                borderRadius: 6.5,
                border: '2px dashed #e2e8f0',
                color: '#64748b',
                mb: 3,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  border: '2px dashed #cbd5e0',
                  bgcolor: 'transparent',
                },
              }}
              startIcon={<CameraIcon />}
            >
              {imageFile ? imageFile.name : 'Attach Image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </Button>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              disabled={!description.length || submitting}
              variant="contained"
              endIcon={<SendIcon />}
              sx={{
                height: 56,
                borderRadius: 7,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                textTransform: 'none',
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0369a1 0%, #075985 100%)',
                  boxShadow: '0 6px 16px rgba(2, 132, 199, 0.4)',
                },
                '&:disabled': {
                  background: '#e2e8f0',
                  color: '#94a3b8',
                },
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>

            {/* Info Alert */}
            <Alert
              icon={<CheckIcon fontSize="small" />}
              severity="info"
              sx={{ mt: 3, borderRadius: 3 }}
            >
              We'll notify you once your ticket is assigned
            </Alert>
          </Box>
        )}

        {/* My Requests Tab */}
        {currentTab === 1 && (
          <>
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2.5, color: '#1e293b' }}>
              Recent Requests
            </Typography>

            {/* Filter Dropdown */}
            <TextField
              select
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{
                mb: 2.5,
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: 'white',
                },
              }}
            >
              <MenuItem value="inprogress">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HourglassIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                  In Progress ({inProgressCount})
                </Box>
              </MenuItem>
              <MenuItem value="verification">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                  To Verify ({verificationCount})
                </Box>
              </MenuItem>
              <MenuItem value="completed">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon sx={{ fontSize: 18, color: '#10b981' }} />
                  Completed
                </Box>
              </MenuItem>
            </TextField>

            {/* Tickets List */}
            <Stack spacing={1.5} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 0.5 }}>
              {filteredTickets.length === 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    borderRadius: 4,
                    border: '2px dashed #e2e8f0',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: 48, mb: 2 }}>📭</Typography>
                  <Typography sx={{ fontSize: 13, color: '#64748b', mb: 0.5 }}>
                    No {filter === 'completed' ? 'completed' : filter === 'verification' ? 'pending verification' : 'in progress'} tickets
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                    {filter === 'verification' ? "You're all caught up!" : "Create a new ticket to get started"}
                  </Typography>
                </Paper>
              )}

              {filteredTickets.map((t) => {
                const statusConfig = getStatusConfig(t.status);
                return (
                  <Paper
                    key={t.id}
                    elevation={0}
                    onClick={() => openDetails(t)}
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      '&:hover': {
                        borderColor: '#0284c7',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
                        {t.category} - {t.status}
                      </Typography>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        size="small"
                        sx={{
                          bgcolor: statusConfig.color,
                          color: statusConfig.textColor,
                          fontWeight: 600,
                          fontSize: 11,
                          height: 24,
                          '& .MuiChip-icon': {
                            color: statusConfig.textColor,
                          },
                        }}
                      />
                    </Box>

                    <Typography sx={{ fontSize: 13, color: '#64748b', mb: 1.5 }}>
                      {t.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                        <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                          {formatTimeAgo(t.created_at)}
                        </Typography>
                      </Box>

                      {t.status === 'Work Completion' && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => openVerifyConfirm(e, t.id)}
                          startIcon={<CheckIcon />}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 12,
                            bgcolor: '#10b981',
                            '&:hover': {
                              bgcolor: '#059669',
                            },
                          }}
                        >
                          Verify
                        </Button>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </>
        )}
      </Container>

      {/* Ticket Details Dialog */}
      <TicketDetails open={detailsOpen} onClose={closeDetails} ticket={selectedTicket} />

      {/* Verification Confirmation Dialog */}
      <Dialog 
        open={confirmOpen} 
        onClose={cancelVerify}
        PaperProps={{
          sx: { borderRadius: 4, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Verification</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to verify that the work is completed?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={cancelVerify}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmVerify} 
            variant="contained"
            sx={{ 
              textTransform: 'none', 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}