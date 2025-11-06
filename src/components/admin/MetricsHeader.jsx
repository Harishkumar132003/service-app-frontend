import { useEffect, useMemo, useState } from 'react'
import { Box, Grid, Paper, Stack, Typography, Tooltip, CircularProgress } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { getMonthlyMetrics } from '../../api/tickets.js'

function useCountUp(value, duration = 500) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let raf, start
    const from = 0
    const to = Number(value) || 0
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setDisplay(Math.round(from + (to - from) * p))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return display
}

function MetricTile({ title, value, color, onClick, tooltip, highlight = false, progress = null }) {
  const v = useCountUp(value)
  return (
    <Tooltip title={tooltip || ''} arrow>
      <Paper
        onClick={onClick}
        elevation={highlight ? 4 : 1}
        sx={{
          p: 2,
          borderRadius: 3,
          cursor: onClick ? 'pointer' : 'default',
          background: highlight
            ? `linear-gradient(135deg, ${alpha('#4338ca',0.06)} 0%, ${alpha('#7c3aed',0.06)} 100%)`
            : 'white',
          transition: 'transform .15s ease, box-shadow .15s ease',
          '&:hover': { transform: onClick ? 'translateY(-2px)' : 'none', boxShadow: 4 }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {progress !== null && (
            <Box sx={{ position: 'relative', width: 54, height: 54 }}>
              <CircularProgress variant="determinate" value={100} size={54} sx={{ color: (t) => alpha(t.palette.text.disabled, 0.25) }} />
              <CircularProgress variant="determinate" value={progress} size={54} sx={{ color, position: 'absolute', left: 0 }} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{Math.round(progress)}%</Typography>
              </Box>
            </Box>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" sx={{ letterSpacing: 1, color: alpha('#0f172a', 0.7) }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color }}>
              {v}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Tooltip>
  )
}

export default function MetricsHeader({ onDrillDown }) {
  const [metrics, setMetrics] = useState({ total: 0, completed: 0, pending: 0, trend: {} })
  const completionRate = useMemo(() => {
    return metrics.total > 0 ? (metrics.completed / metrics.total) * 100 : 0
  }, [metrics])

  useEffect(() => {
    (async () => {
      try {
        const m = await getMonthlyMetrics()
        setMetrics(m)
      } catch (e) {
        setMetrics({ total: 0, completed: 0, pending: 0, trend: {} })
      }
    })()
  }, [])

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={4}>
          <MetricTile
            title="Total Tickets (This Month)"
            value={metrics.total}
            color="#111827"
            highlight
            tooltip="Total tickets created since the start of this month."
            onClick={() => onDrillDown?.({ period: 'month' })}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <MetricTile
            title="Closed"
            value={metrics.completed}
            color="#22c55e"
            progress={completionRate}
            tooltip="All tickets completed this month. Click to view."
            onClick={() => onDrillDown?.({ period: 'month', status: 'Completed' })}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <MetricTile
            title="Pending"
            value={metrics.pending}
            color="#f59e0b"
            tooltip="Tickets not yet completed this month. Click to view."
            onClick={() => onDrillDown?.({ period: 'month', status: 'Pending' })}
          />
        </Grid>
      </Grid>
    </Box>
  )
}
