import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Snackbar,
  Alert,
  Skeleton,
} from '@mui/material';
import AdminLayout from '../../components/AdminLayout.jsx';
import { createCategory, listCategories } from '../../api/categories.js';

export default function Configuration() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });

  async function load() {
    setFetching(true);
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (e) {
      setCategories([]);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate() {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await createCategory({ name: trimmed });
      setName('');
      await load();
      setToast({ open: true, type: 'success', message: 'Category created' });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to create category';
      setToast({ open: true, type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }

  const filtered = (categories || []).filter(c => (c.name || '').toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <AdminLayout title="Configuration">
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            p: 3,
            color: 'white'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Configuration
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip label={`${categories.length} Categories`} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
            </Stack>
          </Box>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Product Categories
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="New Category Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    size="small"
                    error={Boolean(name) && name.trim().length < 3}
                    helperText={Boolean(name) && name.trim().length < 3 ? 'Minimum 3 characters' : ' '}
                  />
                  <Button
                    variant="contained"
                    onClick={onCreate}
                    disabled={!name.trim() || name.trim().length < 3 || loading}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </Button>
                </Stack>
                <TextField
                  label="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                />
                {fetching ? (
                  <Stack spacing={1}>
                    <Skeleton height={24} />
                    <Skeleton height={24} width="60%" />
                    <Skeleton height={24} width="80%" />
                  </Stack>
                ) : filtered.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No categories found
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {filtered.map((c) => (
                      <Chip key={c.id} label={c.name} variant="outlined" />
                    ))}
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.type} onClose={() => setToast((t) => ({ ...t, open: false }))} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}
