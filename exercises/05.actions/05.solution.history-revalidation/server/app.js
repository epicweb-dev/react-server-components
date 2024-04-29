import { Readable } from 'node:stream'
import busboy from 'busboy'
import closeWithGrace from 'close-with-grace'
import { createElement as h } from 'react'
import {
	renderToPipeableStream,
	decodeReplyFromBusboy,
} from 'react-server-dom-esm/server'
import { App } from '../src/app.js'
import { shipDataStorage } from './async-storage.js'

const PORT = process.env.PORT || 3000

import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'

const app = new Hono()

app.use(compress())
// this is here so the workshop app knows when the server has started
app.get('/', () => new Response())

app.use(serveStatic({ root: 'public', index: false }))
app.use('/js/src', serveStatic({ root: 'src' }))

// This just cleans up the URL if the search ever gets cleared... Not important
// for RSCs... Just ... I just can't help myself. I like URLs clean.
app.use(({ req, redirect }) => {
	if (req.query('search') === '') {
		/**
		 * @fixme Not sure what Kent means by
		 * `req.query.search` and `req.search`.
		 */
		const searchParams = new URLSearchParams()
		searchParams.delete('search')
		const location = [req.path, searchParams.toString()]
			.filter(Boolean)
			.join('?')
		return redirect(location, 302)
	}
})

const moduleBasePath = new URL('../src', import.meta.url).href

/**
 *
 * @param {import("hono").Context} context
 */
async function renderApp(context, returnValue) {
	const { req, res } = context
	try {
		const shipId = req.param('shipId') || null
		const search = req.query('search') || ''
		const data = { shipId, search }
		// Since Hono operates with web streams
		// and "react-server-dom-esm" with Node.js streams,
		// create a Readable, pipe RSD there, and convert it
		// to a web ReadableStream for response.
		const readable = new Readable()
		shipDataStorage.run(data, () => {
			const root = h(App)
			const payload = { root, returnValue }
			const { pipe } = renderToPipeableStream(payload, moduleBasePath)
			pipe(readable)
		})
		return new Response(Readable.toWeb(readable))
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: error.message })
	}
}

app.get('/rsc/:shipId?', async context => {
	await renderApp(context, null)
})

app.post('/action/:shipId?', async context => {
	const serverReference = context.req.get('rsc-action')
	const [filepath, name] = serverReference.split('#')
	const action = (await import(filepath))[name]
	// Validate that this is actually a function we intended to expose and
	// not the client trying to invoke arbitrary functions. In a real app,
	// you'd have a manifest verifying this before even importing it.
	if (action.$$typeof !== Symbol.for('react.server.reference')) {
		throw new Error('Invalid action')
	}

	const bb = busboy({
		// Busboy expects Node.js IncomingHeaders, which is an object.
		headers: Object.fromEntries(context.req.raw.headers.entries()),
	})
	const reply = decodeReplyFromBusboy(bb, moduleBasePath)
	Readable.fromWeb(context.req.raw.body).pipe(bb)
	const args = await reply
	const result = await action(...args)

	await renderApp(res, result)
})

app.get('/:shipId?', serveStatic({ root: 'public', path: 'index.html' }))

const server = serve(
	{
		port: PORT,
		fetch: app.fetch,
	},
	() => {
		console.log(`🚀  We have liftoff!`)
		console.log(`http://localhost:${PORT}`)
	},
)

closeWithGrace(async ({ signal, err }) => {
	if (err) console.error('Shutting down server due to error', err)
	else console.log('Shutting down server due to signal', signal)

	await new Promise(resolve => server.close(resolve))
	process.exit()
})
