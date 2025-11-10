import { useState } from 'react';
import { Box, Button, Stack, Typography, Drawer, IconButton } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function MemberLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const linkStyle = ({ isActive }) => ({
    textTransform: 'none',
    justifyContent: 'flex-start',
    color: isActive ? '#0ea5e9' : '#1e293b',
    backgroundColor: isActive ? 'rgba(14,165,233,0.08)' : 'transparent',
    borderRadius: 8,
    padding: '10px 12px',
    width: '100%',
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Box sx={{          background: 'linear-gradient(135deg, #0284c7 0%, #0c70a6 100%)',
      p: 1,
}}>
     {!open && <IconButton
        onClick={() => setOpen(true)}
        sx={{

          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: 1,
          '&:hover': { bgcolor: 'white' },
        }}
        size="small"
      >
        <MenuIcon fontSize="small" />
      </IconButton> }
      </Box>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        anchor="left"
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 260 } }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Member
            </Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <NavLink to="/user" end style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
              <Button variant="text" sx={linkStyle}>
                Home
              </Button>
            </NavLink>
            <NavLink to="/user/profile" style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
              <Button variant="text" sx={linkStyle}>
                Profile
              </Button>
            </NavLink>
          </Stack>

          <Box sx={{ mt: 'auto' }}>
            <Button
              onClick={() => { setOpen(false); handleLogout(); }}
              variant="outlined"
              color="inherit"
              fullWidth
              sx={{ textTransform: 'none', borderRadius: 8 }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Box >
        <Outlet />
      </Box>
    </Box>
  );
}
