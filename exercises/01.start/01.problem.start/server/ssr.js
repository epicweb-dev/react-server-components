import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import { createElement as h } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { getShip, searchShips } from '../db/ship-api.js'
import { Document } from '../src/app.js'

const PORT = process.env.PORT || 3000

const app = express()

app.use(compress())

app.head('/', async (req, res) => {
	res.status(200).end()
})

app.all('/', async function (req, res) {
	if (req.accepts('text/html')) {
		try {
			const shipId = '6c86fca8b9086'
			const search = ''
			const ship = await getShip({ shipId })
			const shipResults = await searchShips({ search })
			// Render it into HTML by resolving the client components
			res.set('Content-type', 'text/html')
			const { pipe } = renderToPipeableStream(
				h(Document, { shipId, search, ship, shipResults }),
			)
			pipe(res)
		} catch (e) {
			console.error(`Failed to SSR: ${e.stack}`)
			res.statusCode = 500
			res.end()
		}
	} else {
		console.error(`non-html responses not yet supported`)
		res.statusCode = 500
		res.end('Error: Non-HTML responses not yet supported')
	}
})

app.use(express.static('public'))

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
