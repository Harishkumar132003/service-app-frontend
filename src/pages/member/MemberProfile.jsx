import { useEffect, useState } from 'react';
import { Box, Container, Paper, Stack, Typography, Chip, Divider } from '@mui/material';
import { getCurrentUser } from '../../api/users.js';

export default function MemberProfile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCurrentUser();
        setMe(data);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          height: 100,
        }}
      />
      <Container maxWidth="sm" sx={{ mt: -6, pb: 6 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Profile</Typography>
            <Typography variant="body2" color="text.secondary">
              View your account information
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {loading && (
            <Typography variant="body2" color="text.secondary">Loading...</Typography>
          )}

          {!loading && me && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="overline" color="text.secondary">Email</Typography>
                <Typography sx={{ fontWeight: 600 }}>{me.email}</Typography>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">Role</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label={me.role} />
                </Stack>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">Companies</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {(me.companies && me.companies.length) ? (
                    me.companies.map((c) => (
                      <Chip key={c.id} label={c.name || c.id} size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">None</Typography>
                  )}
                </Stack>
              </Box>

              
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
