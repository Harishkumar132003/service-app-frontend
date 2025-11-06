import { MenuItem, Stack, TextField, Typography ,Container, Card, CardContent } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DatePicker, Space } from 'antd'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useNavigate } from 'react-router-dom';
import { listTickets } from '../../api/tickets.js'
import TicketDetails from '../../components/TicketDetails.jsx'
import AdminLayout from '../../components/AdminLayout.jsx'
import styled from "styled-components";



const StyledRangePickerContainer = styled.div`.ant-picker-panel {
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


const ViewAdminHistory = () => {
  const role = window.location.pathname.includes('/manager/history') ? 'manager' : 'admin';
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Completed');
  const [tickets, setTickets] = useState([]);
  const [dateRange, setDateRange] = useState([null, null])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  dayjs.extend(customParseFormat)
  const { RangePicker } = DatePicker

  const disabledDate = (current) => {
    // disallow selecting future dates
    return current && current > dayjs().endOf('day')
  }
  
  async function load(){
    const params = { status: filter }
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.created_after = dayjs(dateRange[0]).startOf('day').unix()
      params.created_before = dayjs(dateRange[1]).endOf('day').unix()
    }
    const t = await listTickets(params)
    setTickets(t)
  }

  useEffect(()=>{ load() }, [filter, dateRange])
  

  return (
    <AdminLayout title={role == 'manager' ? 'Manager History' : 'History'}>
      <Container maxWidth='lg'>
      
      {/* History filters */}
      <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1, flexWrap: 'wrap' }}>
        <TextField
          select
          size='small'
          label='Filter'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
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
        <Space size={8} wrap>
          <RangePicker
          superPrevIcon={false}
            allowClear
            panelRender={(panelNode) => (
         <StyledRangePickerContainer>{ panelNode }</StyledRangePickerContainer>
     )}
            // disabledDate={disabledDate}
            value={dateRange}
            onChange={(vals) => setDateRange(vals)}
            format={['YYYY-MM-DD', 'YYYY/MM/DD']}
            placeholder={["Start date","End date"]}
          />
        </Space>
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
      </Container>
    </AdminLayout>
  );
};

export default ViewAdminHistory;
