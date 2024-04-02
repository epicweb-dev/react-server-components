import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
// 💰 you'll need these
// import { createElement as h } from 'react'
// import { renderToPipeableStream } from 'react-server-dom-esm/server'
import { getShip, searchShips } from '../db/ship-api.js'
// 💰 you'll want this too:
// import { App } from '../src/app.js'

const PORT = process.env.PORT || 3000

const app = express()
app.use(compress())
// this is here so the workshop app knows when the server has started
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

// 🐨 change this from /api to /rsc
app.get('/api/:shipId?', async function (req, res) {
	try {
		const shipId = req.params.shipId || null
		const search = req.query.search || ''
		const ship = shipId ? await getShip({ shipId }) : null
		const shipResults = await searchShips({ search })
		// 🐨 rename data to props
		const data = { shipId, search, ship, shipResults }
		// 🐨 remove res.json and instead call renderToPipeableStream from react-server-dom-esm/server
		// and pass it the App component and the props
		// 💰 remember, we don't have a JSX transformer here, so you'll use
		// createElement directly which we aliased to `h` for brievity above.
		return res.json(data)
		// 🐨 Now pipe the stream into the response
		// 💰 pipe(res)

		// 📜 the API for this is about the same as it is in the react-dom package
		// https://react.dev/reference/react-dom/server/renderToPipeableStream
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
	console.log(`🚀  We have liftoff!`)
	console.log(`http://localhost:${PORT}`)
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
