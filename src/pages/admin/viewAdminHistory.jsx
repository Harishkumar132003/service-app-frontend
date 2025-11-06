import { MenuItem, Stack, TextField, Typography, Container, Box, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';
import { listTickets } from '../../api/tickets.js';
import TicketDetails from '../../components/TicketDetails.jsx';
import AdminLayout from '../../components/AdminLayout.jsx';
import styled from "styled-components";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';

const StyledRangePickerContainer = styled.div`
  .ant-picker-panel {
    &:last-child {
      width: 0;
      .ant-picker-header {
        position: absolute;
        right: 0;
        .ant-picker-header-prev-btn, .ant-picker-header-view {
          visibility: hidden;
        }
      }

      .ant-picker-body {
        display: none;
      }

      .ant-picker-header-super-next-btn {
        visibility: hidden;
        pointer-events: none !important;
      }

      @media (min-width: 768px) {
        width: 280px!important;
        
        .ant-picker-header {
          position: relative;
          .ant-picker-header-prev-btn, .ant-picker-header-view {
            visibility: initial;
          }
        }

        .ant-picker-body {
          display: block;
        }
      }
    }
  }
`;

const FilterSection = styled(Box)`
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
`;

const FilterLabel = styled(Typography)`
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const HistoryCard = styled(Paper)`
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }
`;

const StatusBadge = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
`;

const ListHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
  margin-bottom: 12px;
`;

const ViewAdminHistory = () => {
  const role = window.location.pathname.includes('/manager/history') ? 'manager' : 'admin';
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Completed');
  const [tickets, setTickets] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  dayjs.extend(customParseFormat);
  dayjs.extend(relativeTime);
  const { RangePicker } = DatePicker;

  const disabledDate = (current) => {
    return current && current > dayjs().endOf('day');
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Completed': {
        color: '#d1fae5',
        textColor: '#065f46',
        icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
        label: 'Completed'
      },
      'Work Completion': {
        color: '#fef3c7',
        textColor: '#92400e',
        icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} />,
        label: 'To Verify'
      },
      'Manager Approval': {
        color: '#dbeafe',
        textColor: '#1e40af',
        icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} />,
        label: 'Awaiting Approval'
      },
      'Member Verification': {
        color: '#e0e7ff',
        textColor: '#4338ca',
        icon: <VerifiedIcon sx={{ fontSize: 14 }} />,
        label: 'Verified'
      },
      'Accountant Processing': {
        color: '#fce7f3',
        textColor: '#9f1239',
        icon: <AccountBalanceWalletIcon sx={{ fontSize: 14 }} />,
        label: 'Payment Processing'
      },
      'Admin Review': {
        color: '#fee2e2',
        textColor: '#991b1b',
        icon: <CancelIcon sx={{ fontSize: 14 }} />,
        label: 'Declined'
      }
    };
    return configs[status] || configs['Completed'];
  };

  const formatTimeAgo = (timestamp) => {
    const date = dayjs.unix(timestamp);
    const now = dayjs();
    const diffDays = now.diff(date, 'day');
    
    if (diffDays === 0) {
      const diffHours = now.diff(date, 'hour');
      if (diffHours === 0) {
        return 'Just now';
      }
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.format('MMM D, YYYY');
    }
  };

  async function load() {
    const params = { status: filter };
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.created_after = dayjs(dateRange[0]).startOf('day').unix();
      params.created_before = dayjs(dateRange[1]).endOf('day').unix();
    }
    const t = await listTickets(params);
    setTickets(t);
  }

  useEffect(() => { load(); }, [filter, dateRange]);

  return (
    <AdminLayout title={role === 'manager' ? 'Manager History' : 'History'}>
      <Container maxWidth='lg' sx={{ py: 3 }}>
        
        {/* Filter Section */}
        <FilterSection>
          <Stack spacing={2}>
            <Box>
              <FilterLabel sx={{
    fontWeight: 600,
    fontSize: '11px',
    letterSpacing: '0.6px',
    color: '#64748b', // slate-500
    textTransform: 'uppercase',
    ml: 0.3
  }}>Filter by Status</FilterLabel>
              <TextField
                select
                fullWidth
                size='medium'
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: 'white',
                    height: 44,
                    '&:hover fieldset': {
                      borderColor: '#cbd5e0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    }
                  }
                }}
              >
                {role !== 'manager' && (
                  <MenuItem value='Manager Approval'>Wait For Approval</MenuItem>
                )}
                {role !== 'manager' && (
                  <MenuItem value='Admin Review'>Decline</MenuItem>
                )}
                <MenuItem value='Work Completion'>To Verify (Work Submitted)</MenuItem>
                <MenuItem value='Member Verification'>Verified by Member</MenuItem>
                <MenuItem value='Accountant Processing'>Payment Processing</MenuItem>
                <MenuItem value='Completed'>Completed</MenuItem>
              </TextField>
            </Box>

            <Box>
              <FilterLabel sx={{
    fontWeight: 600,
    fontSize: '11px',
    letterSpacing: '0.6px',
    color: '#64748b', // slate-500
    textTransform: 'uppercase',
    ml: 0.3
  }}>Date Range</FilterLabel>
              <Space size={8} style={{ width: '100%' }}>
                <RangePicker
                  style={{ 
                    width: '100%',
                    borderRadius: '10px',
                    padding: '10px 16px'
                  }}
                  superPrevIcon={false}
                  allowClear
                  panelRender={(panelNode) => (
                    <StyledRangePickerContainer>{panelNode}</StyledRangePickerContainer>
                  )}
                  value={dateRange}
                  onChange={(vals) => setDateRange(vals)}
                  format={['YYYY-MM-DD', 'YYYY/MM/DD']}
                  placeholder={["Start date", "End date"]}
                />
              </Space>
            </Box>
          </Stack>
        </FilterSection>

        {/* List Header */}
        <ListHeader>
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Recent Items
          </Typography>
          <Typography
            sx={{
              fontSize: '13px',
              color: '#94a3b8'
            }}
          >
            {tickets.length}
          </Typography>
        </ListHeader>

        {/* History Cards */}
        <Stack spacing={1.5}>
          {tickets.map((t) => {
            const statusConfig = getStatusConfig(t.status);
            return (
              <HistoryCard
                key={t.id}
                elevation={0}
                onClick={() => {
                  setSelectedTicket(t);
                  setDetailsOpen(true);
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1a202c'
                    }}
                  >
                    {t.category} - {t.status}
                  </Typography>
                  
                  <StatusBadge
                    sx={{
                      backgroundColor: statusConfig.color,
                      color: statusConfig.textColor
                    }}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </StatusBadge>
                </Box>

                <Typography
                  variant='body2'
                  sx={{
                    color: '#64748b',
                    mb: 1.5,
                    fontSize: '14px'
                  }}
                >
                  {t.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: '#94a3b8'
                    }}
                  >
                    {formatTimeAgo(t.created_at)}
                  </Typography>
                </Box>
              </HistoryCard>
            );
          })}
        </Stack>

        {/* Empty State */}
        {tickets.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 2
            }}
          >
            <Typography
              sx={{
                fontSize: '16px',
                color: '#64748b',
                mb: 1
              }}
            >
              No tickets found
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                color: '#94a3b8'
              }}
            >
              Try adjusting your filters or date range
            </Typography>
          </Box>
        )}

        <TicketDetails
          open={detailsOpen}
          onClose={() => {
            setDetailsOpen(false);
            setSelectedTicket(null);
          }}
          ticket={selectedTicket}
        />
      </Container>
    </AdminLayout>
  );
};

export default ViewAdminHistory;