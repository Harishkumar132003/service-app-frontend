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
} from '@mui/material';
import AdminLayout from '../../components/AdminLayout.jsx';
import { createCategory, listCategories } from '../../api/categories.js';

export default function Configuration() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (e) {
      setCategories([]);
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
    } catch (err) {
      alert(err?.response?.data?.error || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title="Configuration">
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Service Categories
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="New Category Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={onCreate}
                  disabled={!name.trim() || loading}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Create
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Existing Categories
              </Typography>
              {categories.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No categories available
                </Typography>
              ) : (
                <List>
                  {categories.map((c, idx) => (
                    <Box key={c.id}>
                      <ListItem disableGutters>
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography sx={{ fontWeight: 500 }}>
                                {c.name}
                              </Typography>
                              <Chip size="small" label={new Date((c.created_at || 0) * 1000).toLocaleDateString()} />
                            </Stack>
                          }
                        />
                      </ListItem>
                      {idx < categories.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </AdminLayout>
  );
}
