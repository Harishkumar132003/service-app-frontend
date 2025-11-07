import React from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  Fab,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Collapse,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Slide,
  Zoom,
  alpha,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout.jsx';
import {
  listCompanies as fetchCompanies,
  createCompany,
  deleteCompany,
  addUserToCompany,
  removeUserFromCompany,
  updateCompanyUser,
} from '../../api/companies.js';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'company' or 'user'
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const data = await fetchCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
      setCompanies([]);
    }
  }

  const handleExpandCompany = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  const openCompanyDialog = () => {
    setDialogType('company');
    setDialogOpen(true);
    setSpeedDialOpen(false);
  };

  const openUserDialog = (company) => {
    setSelectedCompany(company);
    setDialogType('user');
    setDialogOpen(true);
    setSpeedDialOpen(false);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setCompanyName('');
    setCompanyEmail('');
    setCompanyPhone('');
    setUserName('');
    setUserEmail('');
    setUserRole('user');
    setSelectedCompany(null);
  };

  const handleCreateCompany = async () => {
    try {
      await createCompany({
        name: companyName,
        email: companyEmail,
        phone: companyPhone,
      });
      closeDialog();
      await loadCompanies();
    } catch (error) {
      console.error('Failed to create company:', error);
      alert(error.response?.data?.error || 'Failed to create company');
    }
  };

  const handleCreateUser = async () => {
    try {
      await addUserToCompany(selectedCompany.id, {
        name: userName,
        email: userEmail,
        role: userRole,
      });
      closeDialog();
      await loadCompanies();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (company, user) => {
    if (!confirm(`Remove ${user.name} from ${company.name}?`)) return;
    
    try {
      await removeUserFromCompany(company.id, user.id);
      await loadCompanies();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleDeleteCompany = async (company) => {
    if (!confirm(`Delete ${company.name}? This will fail if the company has users.`)) return;
    
    try {
      await deleteCompany(company.id);
      await loadCompanies();
    } catch (error) {
      console.error('Failed to delete company:', error);
      alert(error.response?.data?.error || 'Failed to delete company');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#f44336',
      manager: '#ff9800',
      user: '#4caf50',
      serviceprovider: '#2196f3',
      accountant: '#9c27b0',
    };
    return colors[role] || '#757575';
  };

  const speedDialActions = [
    { icon: <BusinessIcon />, name: 'New Company', action: openCompanyDialog },
    // { icon: <PersonIcon />, name: 'Quick Add User', action: () => setSpeedDialOpen(false) },
  ];

  return (
    <AdminLayout title="Company Management">
      <Box sx={{ pb: 10 }} >
        {/* Header with stats */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: 3,
            mb: 3,
            color: 'white',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Organizations
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Chip
              label={`${companies.length} Companies`}
              sx={{
                bgcolor: alpha('#fff', 0.2),
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            />
            <Chip
              label={`${companies.reduce((sum, c) => sum + c.users.length, 0)} Users`}
              sx={{
                bgcolor: alpha('#fff', 0.2),
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            />
          </Box>
        </Box>

        {/* Company List - Modern Expandable Design */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {companies.map((company, index) => (
            <Zoom in key={company.id} style={{ transitionDelay: `${index * 100}ms` }}>
              <Box
                sx={{
                  background: 'white',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Company Header */}
                <Box
                  onClick={() => handleExpandCompany(company.id)}
                  sx={{
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: expandedCompany === company.id
                      ? 'linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                      : 'transparent',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      mr: 2,
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {company.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        size="small"
                        label={`${company.users.length} members`}
                        sx={{ height: 24, fontSize: '0.75rem' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {company.email}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    sx={{
                      transform: expandedCompany === company.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Box>

                {/* Expanded User List */}
                <Collapse in={expandedCompany === company.id} timeout="auto">
                  <Divider />
                  <Box sx={{ bgcolor: alpha('#667eea', 0.02) }}>
                    <Box
                      sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        TEAM MEMBERS
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => openUserDialog(company)}
                        sx={{ textTransform: 'none' }}
                      >
                        Add User
                      </Button>
                    </Box>
                    <List sx={{ pt: 0 }}>
                      {company.users.map((user) => (
                        <ListItem
                          key={user.id}
                          sx={{
                            px: 2,
                            py: 1.5,
                            '&:hover': {
                              bgcolor: alpha('#667eea', 0.05),
                            },
                          }}
                          secondaryAction={
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton 
                                size="small" 
                                edge="end"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(company, user);
                                }}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: getRoleColor(user.role),
                                width: 40,
                                height: 40,
                              }}
                            >
                              {user.name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {user.name}
                                </Typography>
                                <Chip
                                  label={user.role}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: alpha(getRoleColor(user.role), 0.1),
                                    color: getRoleColor(user.role),
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                            }
                            secondary={user.email}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </Box>
            </Zoom>
          ))}
        </Box>

        {/* Empty State */}
        {companies.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
            }}
          >
            <BusinessIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No companies yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get started by creating your first company
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCompanyDialog}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Create Company
            </Button>
          </Box>
        )}

        {/* Floating Speed Dial */}
        <SpeedDial
          ariaLabel="Quick actions"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            '& .MuiFab-primary': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: 64,
              height: 64,
            },
          }}
          icon={<SpeedDialIcon />}
          open={speedDialOpen}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
              sx={{
                '& .MuiSpeedDialAction-fab': {
                  bgcolor: 'white',
                  '&:hover': {
                    bgcolor: alpha('#667eea', 0.1),
                  },
                },
              }}
            />
          ))}
        </SpeedDial>

        {/* Create Company/User Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={closeDialog}
          TransitionComponent={Transition}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              m: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {dialogType === 'company' ? <BusinessIcon /> : <PersonIcon />}
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {dialogType === 'company' ? 'New Company' : `Add User to ${selectedCompany?.name}`}
              </Typography>
            </Box>
            <IconButton onClick={closeDialog} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ paddingTop:'24px !important' }}>
            {dialogType === 'company' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  variant="outlined"
                  
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="User Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  variant="outlined"
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <TextField
                  fullWidth
                  select
                  label="Role"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  variant="outlined"
                  SelectProps={{ native: true }}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="serviceprovider">Service Provider</option>
                  <option value="accountant">Accountant</option>
                </TextField>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={closeDialog} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={dialogType === 'company' ? handleCreateCompany : handleCreateUser}
              disabled={
                dialogType === 'company'
                  ? !companyName || !companyEmail
                  : !userName || !userEmail
              }
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                px: 3,
                borderRadius: 2,
              }}
            >
              Create {dialogType === 'company' ? 'Company' : 'User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
}
