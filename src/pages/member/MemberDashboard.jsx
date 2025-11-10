import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AppBarTop from '../../components/AppBarTop.jsx';
import TicketDetails from '../../components/TicketDetails.jsx';
import { listTickets, createTicket, verifyTicket } from '../../api/tickets.js';
import { listCategories } from '../../api/categories.js';

export default function MemberDashboard() {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [category, setCategory] = useState('bathroom');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('verification');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

const filteredTickets = tickets.filter(t => {
	if (filter === 'completed') return t.status === 'Completed'
	if (filter === 'verification') return t.status === 'Work Completion'
	return t.status !== 'Completed' && t.status !== 'Work Completion'})


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
    await createTicket({ categoryId: usingCatalog ? categoryId : undefined, category: usingCatalog ? undefined : category, description, imageFile });
    if (usingCatalog) {
      setCategoryId(categories[0]?.id || '');
    } else {
      setCategory('bathroom');
    }
    setDescription('');
    setImageFile(null);
    await load();
    setSubmitting(false);
  }

  async function onVerify(id) {
    await verifyTicket(id);
    await load();
  }

  function openVerifyConfirm(e, id){
    e.stopPropagation();
    setVerifyingId(id);
    setConfirmOpen(true);
  }

  async function confirmVerify(){
    if (verifyingId){
      await onVerify(verifyingId)
    }
    setConfirmOpen(false);
    setVerifyingId(null);
  }

  function cancelVerify(){
    setConfirmOpen(false);
    setVerifyingId(null);
  }

  function openDetails(t){
    setSelectedTicket(t);
    setDetailsOpen(true);
  }

  function closeDetails(){
    setDetailsOpen(false);
    setSelectedTicket(null);
  }

  return (
    <Box>
      <AppBarTop title='My Tickets' />
      <Container maxWidth='sm' sx={{ py: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                  New Ticket
                </Typography>
                <Box component='form' onSubmit={onCreate}>
                  <Stack spacing={1.5}>
                    <TextField
                      select
                      label='Category'
                      value={(categories && categories.length) ? categoryId : category}
                      onChange={(e) => {
                        if (categories && categories.length) setCategoryId(e.target.value);
                        else setCategory(e.target.value);
                      }}
                      fullWidth
                    >
                      { categories.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                              {c.name}
                            </MenuItem>
                          ))
                       }
                    </TextField>
                    <TextField
                      label='Description'
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      multiline
                      rows={3}
                      fullWidth
                    />
                    <Button variant='outlined' component='label'>
                      {imageFile ? imageFile.name : 'Attach Image'}
                      <input
                        type='file'
                        accept='image/*'
                        hidden
                        onChange={(e) =>
                          setImageFile(e.target.files?.[0] || null)
                        }
                      />
                    </Button>
                    <Button
                      type='submit'
                      disabled={!description.length || submitting}
                    >
                      Submit
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
              My Requests
            </Typography>
            <Stack
              direction='row'
              spacing={1}
              alignItems='center'
              sx={{ mb: 1 }}
            >
              <TextField
                select
                size='small'
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value='inprogress'>In Progress</MenuItem>
                <MenuItem value='completed'>Completed</MenuItem>
				<MenuItem value="verification">To Verify</MenuItem>
              </TextField>
            </Stack>

            <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {filteredTickets.length === 0 && (
                <Typography variant='body2' color='text.secondary'>No data available</Typography>
              )}
              <Stack spacing={1.5}>
              {filteredTickets.map((t) => (
                <Card key={t.id} onClick={()=>openDetails(t)} sx={{ cursor: 'pointer' }}>
                  <CardContent>
                    <Typography sx={{ fontWeight: 600 }}>
                      {t.category} - {t.status}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {t.description}
                    </Typography>
                    <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                      {t.status === 'Work Completion' && (
                        <Button size='small' onClick={(e) => openVerifyConfirm(e, t.id)}>
                          Verify
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              </Stack>
            </Box>
            <TicketDetails open={detailsOpen} onClose={closeDetails} ticket={selectedTicket} />
          </Grid>
        </Grid>
      </Container>
      <Dialog open={confirmOpen} onClose={cancelVerify}>
        <DialogTitle>Confirm Verification</DialogTitle>
        <DialogContent>
          Are you sure you want to verify that the work is completed?
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelVerify}>Cancel</Button>
          <Button onClick={confirmVerify} variant='contained'>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
