import { readFile } from 'fs/promises'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { RESPONSE_ALREADY_SENT } from '@hono/node-server/utils/response'
import closeWithGrace from 'close-with-grace'
import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { createElement as h } from 'react'
import {
	renderToPipeableStream,
	decodeReply,
} from 'react-server-dom-esm/server'
import { App } from '../src/app.js'
import { shipDataStorage } from './async-storage.js'

const PORT = process.env.PORT || 3000

const app = new Hono({ strict: true })

app.use(trimTrailingSlash())

// This just cleans up the URL if the search ever gets cleared... Not important
// for RSCs... Just ... I just can't help myself. I like URLs clean.
app.use(async (c, next) => {
	const url = new URL(c.req.url)
	if (url.searchParams.get('search') === '') {
		const searchParams = new URLSearchParams(url.search)
		searchParams.delete('search')
		const location = [url.pathname, searchParams.toString()]
			.filter(Boolean)
			.join('?')
		return c.redirect(location, 302)
	} else {
		await next()
	}
})

app.use(
	'/*',
	serveStatic({
		root: './public',
		index: '',
	}),
)

app.use(
	'/js/src/*',
	serveStatic({
		root: './src',
		onNotFound(path, c) {
			c.text('Not found', 404)
		},
		rewriteRequestPath: path => path.replace('/js/src', ''),
	}),
)

const moduleBasePath = new URL('../src', import.meta.url).href

async function renderApp(c, returnValue) {
	const { outgoing } = c.env
	const url = new URL(c.req.url)
	const shipId = c.req.param('shipId') || null
	const search = url.searchParams.get('search') || ''
	const data = { shipId, search }
	shipDataStorage.run(data, () => {
		const root = h(App)
		const payload = { root, returnValue }
		const { pipe } = renderToPipeableStream(payload, moduleBasePath)
		pipe(outgoing)
	})
	return RESPONSE_ALREADY_SENT
}

app.get('/rsc/:shipId?', async c => {
	return await renderApp(c, null)
})

app.post('/action/:shipId?', async c => {
	const serverReference = c.req.header('rsc-action')
	const [filepath, name] = serverReference.split('#')
	const action = (await import(filepath))[name]
	// Validate that this is actually a function we intended to expose and
	// not the client trying to invoke arbitrary functions. In a real app,
	// you'd have a manifest verifying this before even importing it.
	if (action.$$typeof !== Symbol.for('react.server.reference')) {
		throw new Error('Invalid action')
	}

	const formData = await c.req.formData()
	const args = decodeReply(formData, moduleBasePath)
	const result = await action(...args)
	return await renderApp(res, result)
})

app.get('/:shipId?', async c => {
	const html = await readFile('./public/index.html', 'utf8')
	return c.html(html, 200)
})

app.onError((err, c) => {
	console.error('error', err)
	return c.json({ error: true, message: 'Something went wrong' }, 500)
})

console.log(`🚀  starting server at http://localhost:${PORT}`)
const server = serve({
	fetch: app.fetch,
	port: PORT,
})

closeWithGrace(async ({ signal, err }) => {
	if (err) console.error('Shutting down server due to error', err)
	else console.log('Shutting down server due to signal', signal)

	await new Promise(resolve => server.close(resolve))
	process.exit()
})
