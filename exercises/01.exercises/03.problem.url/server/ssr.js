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

// 🐨 update this url to support an optional shipId param
// 💰 /:shipId?
app.get('/', async function (req, res) {
	try {
		// 🐨 get the shipId from req.params.shipId (fallback to null)
		const shipId = '6c86fca8b9086'
		// 🐨 get the search from req.query.search (fallback to '')
		const search = ''
		const ship = await getShip({ shipId })
		const shipResults = await searchShips({ search })
		res.set('Content-type', 'text/html')
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
