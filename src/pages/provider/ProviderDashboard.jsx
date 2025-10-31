import { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material'
import AppBarTop from '../../components/AppBarTop.jsx'
import { listTickets, completeTicket } from '../../api/tickets.js'

export default function ProviderDashboard() {
	const [tickets, setTickets] = useState([])
	const [filesMap, setFilesMap] = useState({})
	async function load(){ setTickets(await listTickets()) }
	useEffect(()=>{ load() },[])

	async function onComplete(t){
		const files = (filesMap[t.id] || [])
		if (!files.length) return
		await completeTicket(t.id, files)
		await load()
	}

	return (
		<Box>
			<AppBarTop title="Provider Dashboard" />
			<Container maxWidth="sm" sx={{ py: 2 }}>
				<Stack spacing={1.5}>
					<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Assigned Tickets</Typography>
					{tickets.map(t=> ( t.status !== 'Work Completion' &&  (
						<Card key={t.id}><CardContent>
							<Typography sx={{ fontWeight: 600 }}>{t.category} - {t.status}</Typography>
							<Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
								<Button variant="outlined" component="label">
									{(filesMap[t.id]?.length||0) ? `${filesMap[t.id].length} file(s)` : 'Add Images'}
									<input type="file" hidden multiple accept="image/*" onChange={(e)=>{
										const arr = Array.from(e.target.files||[])
										setFilesMap(v=>({ ...v, [t.id]: arr }))
									}} />
								</Button>
								<Button onClick={()=>onComplete(t)}>Submit Work</Button>
							</Stack>
						</CardContent></Card>)
					))}
				</Stack>
			</Container>
		</Box>
	)
}
