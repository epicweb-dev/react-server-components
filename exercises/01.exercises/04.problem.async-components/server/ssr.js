import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import { createElement as h } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { getShip, searchShips } from '../db/ship-api.js'
import { Document } from '../src/app.js'
import { shipDataStorage } from './async-storage.js'

const PORT = process.env.PORT || 3000

const app = express()

app.use(compress())

app.head('/', (req, res) => res.status(200).end())

app.use(express.static('public'))

app.get('/:shipId?', async function (req, res) {
	try {
		const shipId = req.params.shipId || null
		const search = req.query.search || ''
		// 💣 delete ship and shipResults
		const ship = shipId ? await getShip({ shipId }) : null
		const shipResults = await searchShips({ search })
		res.set('Content-type', 'text/html')
		// 💣 remove ship and shipResults from this context
		shipDataStorage.run({ shipId, search, ship, shipResults }, () => {
			const root = h(Document)
			const { pipe } = renderToPipeableStream(root)
			pipe(res)
		})
	} catch (e) {
		console.error(`Failed to SSR: ${e.stack}`)
		res.statusCode = 500
		res.end(`Failed to SSR: ${e.stack}`)
	}
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
