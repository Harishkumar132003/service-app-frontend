import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AppBarTop from '../../components/AppBarTop.jsx';
import { listTickets } from '../../api/tickets.js';
import { markPaid } from '../../api/invoices.js';
import { useNavigate } from 'react-router-dom';

export default function AccountantDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [paymentFileMap, setPaymentFileMap] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null); // ticket
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

  return (
    <Box>
      <AppBarTop title='Accountant Dashboard' />
      <Container maxWidth='sm' sx={{ py: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction='row' justifyContent='flex-end'>
            <Button
              variant='text'
              size='small'
              onClick={(e) => {
                e.stopPropagation();
                navigate('/accountant/history');
              }}
            >
              View History
            </Button>
          </Stack>

          <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
            Ready for Payment
          </Typography>
          <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {tickets.filter((t) => t.invoice_id).length === 0 && (
              <Typography variant='body2' color='text.secondary'>
                No data available
              </Typography>
            )}
            {tickets
              .filter((t) => t.invoice_id)
              .map((t) => (
                <Card key={t.id}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 600 }}>
                      {t.category}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Invoice: {t.invoice_id}
                    </Typography>
                    <Stack
                      direction='row'
                      spacing={1}
                      sx={{ mt: 1, alignItems: 'center' }}
                    >
                      <Button variant='outlined' component='label' size='small'>
                        {paymentFileMap[t.id]?.name ||
                          'Upload Payment Image (optional)'}
                        <input
                          type='file'
                          hidden
                          accept='image/*'
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            setPaymentFileMap((v) => ({ ...v, [t.id]: f }));
                          }}
                        />
                      </Button>
                      <Button onClick={() => openConfirm(t)}>
                        Mark As Paid
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
          </Box>
        </Stack>
      </Container>
      <Dialog open={confirmOpen} onClose={closeConfirm}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          Mark this invoice as paid?{' '}
          {paymentFileMap[selected?.id]?.name ? '(with image)' : ''}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Cancel</Button>
          <Button onClick={onPaid} variant='contained'>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
