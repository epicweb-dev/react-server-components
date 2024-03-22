// The RSC server
// This is a server to host data-local resources like databases and RSC

import path from 'path'
import { fileURLToPath } from 'url'

import express from 'express'
import bodyParser from 'body-parser'
import busboy from 'busboy'
import { Readable } from 'stream'
import { promises as fsPromises } from 'fs'

const app = express()
import compress from 'compression'

app.use(compress())

// Application

import { createElement as h } from 'react'
import { asyncLocalStorage } from './region-async-storage.js'

const moduleBasePath = new URL('../src', import.meta.url).href

async function renderApp(res, returnValue) {
	const { renderToPipeableStream } = await import('react-server-dom-esm/server')
	const { Document } = await import('../src/app.js')

	const shipId = res.req.query.shipId || '6c86fca8b9086'
	const search = res.req.query.search || ''
	asyncLocalStorage.run({ shipId, search }, () => {
		const root = h(Document)
		// For client-invoked server actions we refresh the tree and return a return value.
		const payload = returnValue ? { returnValue, root } : root
		const { pipe } = renderToPipeableStream(payload, moduleBasePath)
		pipe(res)
	})
}

app.get('/', async function (req, res) {
	await renderApp(res, null)
})

app.post('/', bodyParser.text(), async function (req, res) {
	const {
		renderToPipeableStream,
		decodeReply,
		decodeReplyFromBusboy,
		decodeAction,
	} = await import('react-server-dom-esm/server')
	const serverReference = req.get('rsc-action')
	if (serverReference) {
		// This is the client-side case
		const [filepath, name] = serverReference.split('#')
		const action = (await import(filepath))[name]
		// Validate that this is actually a function we intended to expose and
		// not the client trying to invoke arbitrary functions. In a real app,
		// you'd have a manifest verifying this before even importing it.
		if (action.$$typeof !== Symbol.for('react.server.reference')) {
			throw new Error('Invalid action')
		}

		let args
		if (req.is('multipart/form-data')) {
			// Use busboy to streamingly parse the reply from form-data.
			const bb = busboy({ headers: req.headers })
			const reply = decodeReplyFromBusboy(bb, moduleBasePath)
			req.pipe(bb)
			args = await reply
		} else {
			args = await decodeReply(req.body, moduleBasePath)
		}
		const result = action.apply(null, args)
		try {
			// Wait for any mutations
			await result
		} catch (x) {
			// We handle the error on the client
		}
		// Refresh the client and return the value
		renderApp(res, result)
	} else {
		// This is the progressive enhancement case
		const fakeRequest = new Request('http://localhost', {
			method: 'POST',
			headers: { 'Content-Type': req.headers['content-type'] },
			body: Readable.from(req),
			duplex: 'half',
		})
		const formData = await fakeRequest.formData()
		const action = await decodeAction(formData, moduleBasePath)
		// Wait for any mutations
		await action()
		renderApp(res, null)
	}
})

app.get('/api/get-ship', async function (req, res) {
	const { getShip } = await import('../db/ship-api.js')
	const searchParams = new URLSearchParams(req.url.split('?')[1])
	const delay = searchParams.get('delay')
	getShip({
		name: searchParams.get('name'),
		delay: delay === null ? undefined : Number(delay),
	})
		.then(ship => res.json(ship))
		.catch(error => res.status(500).send(error.message))
})

app.get('/api/search-ships', async function (req, res) {
	const { searchShips } = await import('../db/ship-api.js')
	const searchParams = new URLSearchParams(req.url.split('?')[1])
	const delay = searchParams.get('delay')
	searchShips({
		query: searchParams.get('query'),
		delay: delay === null ? undefined : Number(delay),
	})
		.then(ship => res.json(ship))
		.catch(error => res.status(500).send(error.message))
})

const port = process.env.PORT || 3001
app.listen(port, () => {
	console.log(`✅ RSC: http://localhost:${port}`)
})

app.on('error', function (error) {
	if (error.syscall !== 'listen') {
		throw error
	}

	switch (error.code) {
		case 'EACCES':
			console.error(`port ${port} requires elevated privileges`)
			process.exit(1)
			break
		case 'EADDRINUSE':
			console.error(`Port ${port} is already in use`)
			process.exit(1)
			break
		default:
			throw error
	}
})
