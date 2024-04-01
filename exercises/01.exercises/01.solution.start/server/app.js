import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import { getShip, searchShips } from '../db/ship-api.js'

const PORT = process.env.PORT || 3000

const app = express()

app.use(compress())

app.head('/', (req, res) => res.status(200).end())

app.use(express.static('public', { index: false }))
app.use('/js/src', express.static('src'))

// This just cleans up the URL if the search ever gets cleared... Not important
// for RSCs... Just ... I just can't help myself. I like URLs clean.
app.use((req, res, next) => {
	if (req.query.search === '') {
		const searchParams = new URLSearchParams(req.search)
		searchParams.delete('search')
		const location = [req.path, searchParams.toString()]
			.filter(Boolean)
			.join('?')
		return res.redirect(302, location)
	} else {
		next()
	}
})

app.get('/api/:shipId?', async function (req, res) {
	try {
		const shipId = req.params.shipId || null
		const search = req.query.search || ''
		return res.json({
			shipId,
			search,
			ship: shipId ? await getShip({ shipId }) : null,
			shipResults: await searchShips({ search }),
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: error.message })
	}
})

app.get('/:shipId?', async function (req, res) {
	res.set('Content-type', 'text/html')
	return res.sendFile('index.html', { root: 'public' })
})

const server = app.listen(PORT, () => {
	console.log(`✅ SSR: http://localhost:${PORT}`)
})

closeWithGrace(async ({ signal, err }) => {
	if (err) console.error('Shutting down server due to error', err)
	else console.log('Shutting down server due to signal', signal)

	await new Promise((resolve, reject) => {
		server.close(err => {
			if (err) reject(err)
			else resolve()
		})
	})
})
