import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
// 💰 you're gonna need these:
// import { getShip, searchShips } from '../db/ship-api.js'

const PORT = process.env.PORT || 3000

const app = express()
app.use(compress())
// this is here so the workshop app knows when the server has started
app.head('/', (req, res) => res.status(200).end())

// 🐨 add a static express handler for the public folder, but leave out the index.html
// 💰 app.use(express.static('public', { index: false }))
// 🐨 add a handler for requests to '/js/src' that serves static files from 'src'
// 💰 app.use('/js/src', express.static('src'))

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

// 🐨 add an API endpoint to get data for our page:
// 💰
// app.get('/api/:shipId?', async function (req, res) {
// 	try {
// 		const shipId = req.params.shipId || null
// 		const search = req.query.search || ''
// 		const ship = shipId ? await getShip({ shipId }) : null
// 		const shipResults = await searchShips({ search })
// 		const data = { shipId, search, ship, shipResults }
// 		return res.json(data)
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).json({ error: error.message })
// 	}
// })

// 🐨 add a handler for '/:shipId?' which means the ship is optional
// 🐨 set the response Content-type to 'text/html' and send the file in public called index.html
// 💰
// app.get('/:shipId?', async function (req, res) {
// 	res.set('Content-type', 'text/html')
// 	return res.sendFile('index.html', { root: 'public' })
// })

const server = app.listen(PORT, () => {
	console.log(`🚀  We have liftoff!`)
	console.log(`http://localhost:${PORT}`)
})

closeWithGrace(async ({ signal, err }) => {
	if (err) console.error('Shutting down server due to error', err)
	else console.log('Shutting down server due to signal', signal)

	await new Promise(resolve => server.close(resolve))
	process.exit()
})
