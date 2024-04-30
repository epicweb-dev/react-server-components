import closeWithGrace from 'close-with-grace'
import fastify from 'fastify'
import compress from '@fastify/compress'
import fastifyStatic from '@fastify/static'
import multipart from '@fastify/multipart'
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

await app
  .register(multipart, {
    // Check out the documentation for the other options.
    // You likely want to store all incoming files into disk
    // and not keep them in memory.
    attachFieldsToBody: true
  })
  .register(compress)
  .register(fastifyStatic, {
    root: join(import.meta.dirname, '..', 'public'),
    index: false,
    wildcard: false
  })
  .register(fastifyStatic, {
    root: join(import.meta.dirname, '..', 'src'),
    index: false,
    wildcard: false,
    decorateReply: false,
    prefix: '/js/src'
  })

// this is here so the workshop app knows when the server has started
app.head('/', (req, res) => res.status(200))

const moduleBasePath = new URL('../src', import.meta.url).href

function renderApp(res, returnValue) {
  const shipId = res.request.params.shipId || null
  const search = res.request.query.search || ''
  const data = { shipId, search }
  return shipDataStorage.run(data, () => {
    const root = h(App)
    const payload = { root, returnValue }

    const { pipe } = renderToPipeableStream(payload, moduleBasePath)
    return pipe(new PassThrough())
  })
}

app.get('/rsc/:shipId?', (req, res) => {
	res.type('text/html').send(renderApp(res, null))
})

app.post('/action/:shipId?', async (req, res) => {
	const serverReference = req.headers['rsc-action']
	const [filepath, name] = serverReference.split('#')
	const action = (await import(filepath))[name]
	// Validate that this is actually a function we intended to expose and
	// not the client trying to invoke arbitrary functions. In a real app,
	// you'd have a manifest verifying this before even importing it.
	if (action.$$typeof !== Symbol.for('react.server.reference')) {
		throw new Error('Invalid action')
	}

  // Convert the parsed body to a FormData object, as that's what decodeReply
  // requires.
  const formData = new FormData()
  for (const [key, value] of Object.entries(req.body)) {
    formData.append(key, value.value)
  }
	const reply = decodeReply(formData, moduleBasePath)
	const args = await reply
	const result = await action(...args)

  res.type('text/html')
  return renderApp(res, result)
})

// This just cleans up the URL if the search ever gets cleared... Not important
// for RSCs... Just ... I just can't help myself. I like URLs clean.
function redirectIfSearchIsEmpty(req, res, next) {
	if (req.query.search === '') {
		const searchParams = new URLSearchParams(req.query)
		searchParams.delete('search')
    const markIndex = req.url.indexOf('?')
    const path = req.url.slice(0, markIndex)
		const location = [path, searchParams.toString()]
			.filter(Boolean)
			.join('?')
		res.redirect(302, location)
    return
	}

  next()
}

app.get('/:shipId?', {
  onRequest: redirectIfSearchIsEmpty
}, function sendIndex(req, res) {
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
