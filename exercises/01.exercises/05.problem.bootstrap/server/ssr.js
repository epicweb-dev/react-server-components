import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import { createElement as h } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { Document } from '../src/app.js'
import { shipDataStorage } from './async-storage.js'

const PORT = process.env.PORT || 3000

const app = express()

app.use(compress())

app.head('/', (req, res) => res.status(200).end())

app.use(express.static('public'))
// 🐨 add a middleware to serve our js src files at /js/src
// 💰 this isn't an express workshop, so here you go:
// app.use('/js/src', express.static('src'))

app.get('/:shipId?', async function (req, res) {
	try {
		const shipId = req.params.shipId || null
		const search = req.query.search || ''
		res.set('Content-type', 'text/html')
		shipDataStorage.run({ shipId, search }, () => {
			const root = h(Document)
			const { pipe } = renderToPipeableStream(
				root,
				// 🐨 add an object here for options
				// 🐨 add the option bootstrapModules that's an array with the string
				// '/js/src/index.js' to load our src/index.js file into the browser
			)
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
