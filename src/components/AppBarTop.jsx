import { AppBar, Toolbar, Typography, IconButton } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../context/AuthContext.jsx'

export default function AppBarTop({ title }) {
	const { logout } = useAuth()
	return (
		<AppBar position="sticky" color="primary" enableColorOnDark>
			<Toolbar sx={{ minHeight: 56 }}>
				<Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
					{title}
				</Typography>
				<IconButton color="inherit" aria-label="logout" onClick={logout}>
					<LogoutIcon />
				</IconButton>
			</Toolbar>
		</AppBar>
	)
}
