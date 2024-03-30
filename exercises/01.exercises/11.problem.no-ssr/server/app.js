import { createRequire } from 'node:module'
import path from 'node:path'
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
import { App } from '../src/app.js'
import { shipDataStorage } from './async-storage.js'

const moduleBasePath = new URL('../src', import.meta.url).href

const PORT = process.env.PORT || 3000

const app = express()

app.use(compress())

app.head('/', (req, res) => res.status(200).end())

app.use(express.static('public'))
app.use('/js/src', express.static('src'))

// we have to server this file from our own server so dynamic imports are
// relative to our own server (this module is what loads client-side modules!)
app.use('/js/react-server-dom-esm/client', (req, res) => {
	const require = createRequire(import.meta.url)
	const pkgPath = require.resolve('react-server-dom-esm')
	const modulePath = path.join(
		path.dirname(pkgPath),
		'esm',
		'react-server-dom-esm-client.browser.development.js',
	)
	res.sendFile(modulePath)
})

async function renderApp(res, returnValue) {
	const shipId = res.req.params.shipId || null
	const search = res.req.query.search || ''
	res.set('x-location', res.req.url)
	shipDataStorage.run({ shipId, search }, () => {
		const root = h(App)
		const payload = { returnValue, root }
		const { pipe } = renderToPipeableStream(payload, moduleBasePath)
		pipe(res)
	})
}

app.get('/:shipId?', async function (req, res) {
	if (req.accepts('text/html')) {
		console.log('sending index.html')
		res.set('Content-type', 'text/html')
		return res.sendFile('index.html', { root: 'public' })
	} else {
		await renderApp(res, null)
	}
})

app.post('/:shipId?', bodyParser.text(), async function (req, res) {
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
