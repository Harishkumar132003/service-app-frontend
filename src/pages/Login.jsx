import { Box, Button, Card, CardContent, CircularProgress, Container, Grid, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
	const { login, loading, role } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const [identifier, setIdentifier] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState(null)

	async function onSubmit(e) {
		e.preventDefault()
		setError(null)
		const res = await login(identifier, password)
		if (res.ok) {
			const storedRole = localStorage.getItem('serviceapp_role') || role
			const path = roleToPath(storedRole)
			navigate((location && location.state && location.state.from && location.state.from.pathname) || path, { replace: true })
		} else {
			setError(res.error || 'Unable to login')
		}
	}

	return (
		<Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 3 } }}>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Typography variant="h5" component="h1" align="center" sx={{ fontWeight: 600 }}>
						Welcome back
					</Typography>
					<Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 0.5 }}>
						Sign in to continue
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Card elevation={3}>
						<CardContent>
							<Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								<TextField
									label="Email or Username"
									fullWidth
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
									autoComplete="username"
									inputProps={{ inputMode: 'email' }}
								/>
								<TextField
									label="Password"
									type="password"
									fullWidth
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="current-password"
								/>
								{error && (
									<Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
										{error}
									</Typography>
								)}
								<Button type="submit" disabled={loading} size="large">
									{loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
								</Button>
							</Box>
						</CardContent>
					</Card>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="caption" align="center" display="block" color="text.secondary">
						By continuing, you agree to the terms and privacy policy.
					</Typography>
				</Grid>
			</Grid>
		</Container>
	)
}

function roleToPath(role) {
	switch (role) {
		case 'admin': return '/admin'
		case 'user': return '/user'
		case 'serviceprovider': return '/serviceprovider'
		case 'accountant': return '/accountant'
		case 'manager': return '/manager'
		default: return '/login'
	}
}
