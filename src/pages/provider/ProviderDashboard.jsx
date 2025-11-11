import { useEffect, useState } from 'react'
import { Box, Button, Container, Stack, Typography, Paper, Chip, IconButton, Badge } from '@mui/material'
import { listTickets, completeTicket } from '../../api/tickets.js'
import {
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  CameraAlt as CameraIcon,
  Build as BuildIcon,
} from '@mui/icons-material'

export default function ProviderDashboard() {
    const [tickets, setTickets] = useState([])
    const [filesMap, setFilesMap] = useState({})
    async function load(){ setTickets(await listTickets({ status: 'Service Provider Assignment' })) }
    useEffect(()=>{ load() },[])

    async function onComplete(t){
        const files = (filesMap[t.id] || [])
        if (!files.length) return
        await completeTicket(t.id, files)
        await load()
    }

    const activeTickets = tickets.filter(t => t.status !== 'Work Completion')
    const newToday = activeTickets.filter(t => {
      const now = Math.floor(Date.now()/1000)
      return t.created_at && (now - t.created_at) <= 86400
    }).length

    const formatTimeAgo = (ts) => {
      if (!ts) return 'Recently'
      const now = Math.floor(Date.now()/1000)
      const diff = now - ts
      if (diff < 3600) {
        const m = Math.max(1, Math.floor(diff/60))
        return `${m} ${m===1?'min':'mins'} ago`
      }
      if (diff < 86400) {
        const h = Math.floor(diff/3600)
        return `${h} ${h===1?'hour':'hours'} ago`
      }
      const d = Math.floor(diff/86400)
      return `${d} ${d===1?'day':'days'} ago`
    }

    const isUrgent = (t) => {
      // Deprecated urgency. Priority is now explicit. Keeping helper for potential future logic.
      const now = Math.floor(Date.now()/1000)
      return t.created_at && (now - t.created_at) > 172800
    }

    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8 }}>
            {/* Header */}
            <Box sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #0c70a6 100%)', py: 3, px: 2, color: 'white', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Provider Dashboard</Typography>
            </Box>

            <Container maxWidth="sm" sx={{ pb: 4 }}>
                {/* Metric Card */}
                <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid #e2e8f0', mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TimeIcon sx={{ color: '#0284c7' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: '#64748b' }}>Active Tickets</Typography>
                      <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{activeTickets.length}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#16a34a' }}>+{newToday} new today</Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* Assigned tickets header */}
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Assigned Tickets</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1.5 }}>
                  {activeTickets.length === 0 ? 'No tickets require attention' : `${activeTickets.length} ticket${activeTickets.length>1?'s':''} require${activeTickets.length>1?'':'s'} attention`}
                </Typography>

                <Stack spacing={2}>
                    {activeTickets.map(t=> (
                        <Paper key={t.id} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                          <Box sx={{ p: 1.5, bgcolor: '#fff7ed', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                            <Stack direction="row" spacing={1.25} alignItems="center">
                              <Box sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BuildIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>TICKET #{t.id.slice(-4)}</Typography>
                                <Typography sx={{ fontWeight: 700 }}>{`${(t.category || '').charAt(0).toUpperCase()}${(t.category||'').slice(1)} - Service Provider`}</Typography>
                              </Box>
                            </Stack>
                          </Box>
                          <Box sx={{ p: 2 }}>
                            <Stack spacing={1.25}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <LocationIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                                <Typography sx={{ fontSize: 14, color: '#1e293b' }}>{t.company?.name || 'Company'}</Typography>
                              </Stack>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Chip size="small" label={(t.priority || 'medium').charAt(0).toUpperCase() + (t.priority || 'medium').slice(1)} sx={{ bgcolor: (t.priority==='urgent'?'#fee2e2': (t.priority==='low'?'#f1f5f9':'#dbeafe')), color: (t.priority==='urgent'?'#ef4444': (t.priority==='low'?'#475569':'#1e40af')), fontWeight: 600 }} />
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: '#64748b' }}>
                                  <TimeIcon sx={{ fontSize: 16 }} />
                                  <Typography sx={{ fontSize: 12 }}>{formatTimeAgo(t.created_at)}</Typography>
                                </Stack>
                              </Stack>
                              <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                                <Button variant="outlined" component="label" sx={{ borderRadius: 3 }}>
                                  {(filesMap[t.id]?.length||0) ? `${filesMap[t.id].length} file(s)` : 'Add Images'}
                                  <input type="file" hidden multiple accept="image/*" onChange={(e)=>{
                                      const arr = Array.from(e.target.files||[])
                                      setFilesMap(v=>({ ...v, [t.id]: arr }))
                                  }} />
                                </Button>
                                <Button variant="contained" onClick={()=>onComplete(t)} disabled={!((filesMap[t.id]?.length||0) > 0)} sx={{ borderRadius: 3 }}>
                                  Submit Work
                                </Button>
                              </Stack>
                            </Stack>
                          </Box>
                        </Paper>
                    ))}
                </Stack>
            </Container>

            {/* Floating action button (non-breaking: refresh list) */}
            {/* <Box sx={{ position: 'fixed', right: 16, bottom: 16 }}>
              <IconButton onClick={load} sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#1d4ed8', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', '&:hover': { bgcolor: '#1e40af' } }}>
                +
              </IconButton>
            </Box> */}
        </Box>
    )
}
