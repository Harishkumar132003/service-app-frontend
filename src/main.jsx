import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App.jsx'

const theme = createTheme({
	palette: { mode: 'light' },
	components: {
		MuiTextField: { defaultProps: { size: 'medium' } },
		MuiButton: { defaultProps: { variant: 'contained' } },
	},
})

ReactDOM.createRoot(document.getElementById('root')).render(
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ThemeProvider>
)
