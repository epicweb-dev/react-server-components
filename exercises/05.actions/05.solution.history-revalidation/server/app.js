import closeWithGrace from 'close-with-grace'
import fastify from 'fastify'
import compress from '@fastify/compress'
import fastifyStatic from '@fastify/static'
import { createElement as h } from 'react'
import { PassThrough } from 'stream'
import {
	renderToPipeableStream,
	decodeReply
} from 'react-server-dom-esm/server'
import { App } from '../src/app.js'
import { shipDataStorage } from './async-storage.js'
import { join } from 'path'

const PORT = process.env.PORT || 3000

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  }
})

await app.register(compress)
await app.register(fastifyStatic, {
  root: join(import.meta.dirname, '..', 'public'),
  index: false,
  wildcard: false
})

await app.register(fastifyStatic, {
  root: join(import.meta.dirname, '..', 'src'),
  index: false,
  wildcard: false,
  decorateReply: false,
  prefix: '/js/src'
})

// this is here so the workshop app knows when the server has started
app.head('/', (req, res) => res.status(200))

// This just cleans up the URL if the search ever gets cleared... Not important
// for RSCs... Just ... I just can't help myself. I like URLs clean.
/*
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
*/

const moduleBasePath = new URL('../src', import.meta.url).href

function renderApp(res, returnValue) {
  const shipId = res.request.params.shipId || null
  const search = res.request.query.search || ''
  const data = { shipId, search }
  return shipDataStorage.run(data, () => {
    const root = h(App)
    const payload = { root, returnValue }

    const { pipe } = renderToPipeableStream(payload, moduleBasePath)
    // TODO(mcollina): this is a workaround, it should not be needed but we are
    // missing the primitive in the react-server-dom-esm package.
    const stream = new PassThrough()
    pipe(stream)
    return stream
  })
}

app.get('/rsc/:shipId?', (req, res) => {
	res.type('text/html').send(renderApp(res, null))
})

app.post('/action/:shipId?', async (req, res) => {
	const serverReference = req.get('rsc-action')
	const [filepath, name] = serverReference.split('#')
	const action = (await import(filepath))[name]
	// Validate that this is actually a function we intended to expose and
	// not the client trying to invoke arbitrary functions. In a real app,
	// you'd have a manifest verifying this before even importing it.
	if (action.$$typeof !== Symbol.for('react.server.reference')) {
		throw new Error('Invalid action')
	}

	const reply = decodeReply(req.body, moduleBasePath)
	const args = await reply
	const result = await action(...args)

	await renderApp(res, result)
})

app.get('/', async (req, res) => {
	res.type('text/html')
	return res.sendFile('index.html')
})

app.get('/:shipId', async (req, res) => {
	res.type('text/html')
	return res.sendFile('index.html')
})

await app.listen({ port: PORT })

closeWithGrace(async ({ signal, err }) => {
  if (err) {
    app.log.error(err, 'Shutting down server due to error')
  } else if (signal) {
    app.log.info({ signal }, 'Shutting down server due to signal')
  }

	await app.close()
})
