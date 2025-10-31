import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Container, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import AppBarTop from '../../components/AppBarTop.jsx'
import { listTickets, createTicket, verifyTicket } from '../../api/tickets.js'

const CATEGORIES = ['bathroom','table','ac']

export default function MemberDashboard() {
	const [tickets, setTickets] = useState([])
	const [category, setCategory] = useState('bathroom')
	const [description, setDescription] = useState('')
	const [imageFile, setImageFile] = useState(null)
	const [submitting, setSubmitting] = useState(false)

	async function load() {
		const t = await listTickets()
		setTickets(t)
	}

	useEffect(() => { load() }, [])

	async function onCreate(e) {
		e.preventDefault()
		if (!imageFile) return
		setSubmitting(true)
		await createTicket({ category, description, imageFile })
		setCategory('bathroom'); setDescription(''); setImageFile(null)
		await load()
		setSubmitting(false)
	}

	async function onVerify(id) {
		await verifyTicket(id)
		await load()
	}

	return (
		<Box>
			<AppBarTop title="My Tickets" />
			<Container maxWidth="sm" sx={{ py: 2 }}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Card>
							<CardContent>
								<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>New Ticket</Typography>
								<Box component="form" onSubmit={onCreate}>
									<Stack spacing={1.5}>
										<TextField select label="Category" value={category} onChange={(e)=>setCategory(e.target.value)} fullWidth>
											{CATEGORIES.map(c=> <MenuItem key={c} value={c}>{c}</MenuItem>)}
										</TextField>
										<TextField label="Description" value={description} onChange={(e)=>setDescription(e.target.value)} multiline rows={3} fullWidth />
										<Button variant="outlined" component="label">
											{imageFile ? imageFile.name : 'Attach Image'}
											<input type="file" accept="image/*" hidden onChange={(e)=>setImageFile(e.target.files?.[0]||null)} />
										</Button>
										<Button type="submit" disabled={!imageFile || submitting}>Submit</Button>
									</Stack>
								</Box>
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={12}>
						<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>My Requests</Typography>
						<Stack spacing={1.5}>
							{tickets.map(t => (
								<Card key={t.id}>
									<CardContent>
										<Typography sx={{ fontWeight: 600 }}>{t.category} - {t.status}</Typography>
										<Typography variant="body2" color="text.secondary">{t.description}</Typography>
										<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
											{t.status === 'Work Completion' && (
												<Button size="small" onClick={() => onVerify(t.id)}>Verify</Button>
											)}
										</Stack>
									</CardContent>
								</Card>
							))}
						</Stack>
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}
