import bodyParser from 'body-parser'
import busboy from 'busboy'
import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import { createElement as h } from 'react'
import {
	renderToPipeableStream,
	decodeReplyFromBusboy,
} from 'react-server-dom-esm/server'
import { Document } from '../src/app.js'
import { shipDataStorage } from './async-storage.js'

const PORT = process.env.PORT || 3001

const app = express()

app.use(compress())

const moduleBasePath = new URL('../src', import.meta.url).href

async function renderApp(res, returnValue) {
	const shipId = res.req.params.shipId || null
	const search = res.req.query.search || ''
	shipDataStorage.run({ shipId, search }, () => {
		const root = h(Document)
		const payload = { returnValue, root }
		const { pipe } = renderToPipeableStream(payload, moduleBasePath)
		pipe(res)
	})
}

app.get('/rsc/:shipId?', async function (req, res) {
	await renderApp(res, null)
})

app.post('/action/:shipId?', bodyParser.text(), async function (req, res) {
	const serverReference = req.get('rsc-action')
	// This is the client-side case
	const [filepath, name] = serverReference.split('#')
	const action = (await import(filepath))[name]
	// Validate that this is actually a function we intended to expose and
	// not the client trying to invoke arbitrary functions. In a real app,
	// you'd have a manifest verifying this before even importing it.
	if (action.$$typeof !== Symbol.for('react.server.reference')) {
		throw new Error('Invalid action')
	}

	const bb = busboy({ headers: req.headers })
	const reply = decodeReplyFromBusboy(bb, moduleBasePath)
	req.pipe(bb)
	const args = await reply
	const result = action.apply(null, args)
	try {
		// Wait for any mutations
		await result
	} catch (x) {
		// We handle the error on the client
	}
	// Refresh the client and return the value
	await renderApp(res, result)
})

const server = app.listen(PORT, () => {
	console.log(`✅ RSC: http://localhost:${PORT}`)
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
