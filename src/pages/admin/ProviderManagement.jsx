import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Email as EmailIcon, Business as BusinessIcon, Handyman as HandymanIcon, Close as CloseIcon } from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout.jsx'
import { listUsersByRole, createUser, updateUser } from '../../api/users.js'
import { listCompanies } from '../../api/companies.js'

export default function ProviderManagement(){
  const [providers, setProviders] = useState([])
  const [companies, setCompanies] = useState([])
  const [companyMap, setCompanyMap] = useState({})
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [onsiteCompanyId, setOnsiteCompanyId] = useState('')
  const [editTarget, setEditTarget] = useState(null)

  async function load(){
    const [prov, comps] = await Promise.all([
      listUsersByRole('serviceprovider'),
      listCompanies().catch(()=>[])
    ])
    setProviders(prov||[])
    setCompanies(comps||[])
    setCompanyMap(Object.fromEntries((comps||[]).map(c=>[c.id, c.name])))
  }

  useEffect(()=>{ load() },[])

  function openCreate(){
    setName('')
    setEmail('')
    setOnsiteCompanyId('')
    setCreateOpen(true)
  }

  function closeCreate(){
    setCreateOpen(false)
  }

  async function onCreate(){
    if (!email.trim()) return
    setCreating(true)
    try{
      await createUser({ role: 'serviceprovider', name: name.trim(), email: email.trim(), onsite_company_id: onsiteCompanyId || null })
      setCreateOpen(false)
      await load()
    } finally {
      setCreating(false)
    }
  }

  function openEdit(p){
    setEditTarget(p)
    setName(p.name||'')
    setEmail(p.email||'')
    setOnsiteCompanyId(p.onsite_company_id||'')
    setEditOpen(true)
  }

  function closeEdit(){
    setEditOpen(false)
    setEditTarget(null)
  }

  async function onUpdate(){
    if (!editTarget) return
    setUpdating(true)
    try{
      await updateUser(editTarget.id, { name: name.trim(), onsite_company_id: onsiteCompanyId || null })
      setEditOpen(false)
      await load()
    } finally {
      setUpdating(false)
    }
  }

  const total = providers.length
  const withOnsite = useMemo(()=>providers.filter(p=>!!p.onsite_company_id).length,[providers])

  return (
    <AdminLayout title="Service Providers">
      <Box>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 4,
            p: 3,
            mb: 3,
            color: 'white',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <HandymanIcon />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Service Providers</Typography>
            </Stack>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ textTransform: 'none', borderRadius: 2 }}>
              Add Provider
            </Button>
          </Stack>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Chip label={`${total} Providers`} sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontWeight: 600 }} />
            <Chip label={`${withOnsite} With On-site`} sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontWeight: 600 }} />
          </Box>
        </Box>

        <Container maxWidth="lg" disableGutters>
          <Stack spacing={1.5}>
            {providers.map((p)=> (
              <Box key={p.id}
                sx={{
                  background: 'white',
                  borderRadius: 3,
                  px: 2,
                  py: 1.5,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{p.name || p.email}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">{p.email}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: .5 }}>
                      <BusinessIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">{p.onsite_company_id ? (companyMap[p.onsite_company_id] || p.onsite_company_id) : 'No on-site company'}</Typography>
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={()=>openEdit(p)} sx={{ textTransform: 'none', borderRadius: 2 }}>Edit</Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      <Dialog open={createOpen} onClose={closeCreate} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Add Provider</Typography>
          <IconButton onClick={closeCreate}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            <TextField label="Name" value={name} onChange={(e)=>setName(e.target.value)} fullWidth />
            <TextField label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} fullWidth InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <TextField select fullWidth label="On-site Company (optional)" value={onsiteCompanyId} onChange={(e)=>setOnsiteCompanyId(e.target.value)}>
              <MenuItem value="">None</MenuItem>
              {(companies||[]).map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name || c.id}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeCreate} sx={{ textTransform:'none' }}>Cancel</Button>
          <Button variant="contained" onClick={onCreate} disabled={creating || !email.trim()} sx={{ textTransform:'none' }}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Provider</Typography>
          <IconButton onClick={closeEdit}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Stack spacing={2.5}>
            <TextField label="Name" value={name} onChange={(e)=>setName(e.target.value)} fullWidth />
            <TextField label="Email" type="email" value={email} disabled fullWidth InputProps={{ startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
            <TextField select fullWidth label="On-site Company (optional)" value={onsiteCompanyId} onChange={(e)=>setOnsiteCompanyId(e.target.value)}>
              <MenuItem value="">None</MenuItem>
              {(companies||[]).map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name || c.id}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeEdit} sx={{ textTransform:'none' }}>Cancel</Button>
          <Button variant="contained" onClick={onUpdate} disabled={updating || !editTarget} sx={{ textTransform:'none' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  )
}
