import http from 'node:http'
import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import { createElement as h, use } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { createFromNodeStream } from 'react-server-dom-esm/client'

const PORT = process.env.PORT || 3000
const RSC_PORT = process.env.RSC_PORT || 3001
const RSC_ORIGIN = new URL(`http://localhost:${RSC_PORT}`)

const app = express()

app.use(compress())

function request(options, body) {
	return new Promise((resolve, reject) => {
		const req = http.request(options, res => {
			resolve(res)
		})
		req.on('error', e => {
			reject(e)
		})
		body.pipe(req)
	})
}

app.head('/', (req, res) => res.status(200).end())

app.use(express.static('public'))

app.all('/:shipId?', async function (req, res) {
	// Proxy the request to the rsc server.
	const proxiedHeaders = {
		'X-Forwarded-Host': req.hostname,
		'X-Forwarded-For': req.ips,
		'X-Forwarded-Port': PORT,
		'X-Forwarded-Proto': req.protocol,
	}
	if (req.get('Content-Type')) {
		proxiedHeaders['Content-Type'] = req.get('Content-Type')
	}

	const promiseForData = request(
		{
			host: RSC_ORIGIN.hostname,
			port: RSC_ORIGIN.port,
			method: req.method,
			path: req.url,
			headers: proxiedHeaders,
		},
		req,
	)

	try {
		const rscResponse = await promiseForData

		// For HTML, we're a "client" emulator that runs the client code,
		// so we start by consuming the RSC payload. This needs the local file path
		// to load the source files from as well as the URL path for preloads.

		let contentPromise
		function Root() {
			contentPromise ??= createFromNodeStream(rscResponse)
			const content = use(contentPromise)
			return content.root
		}
		const { pipe } = renderToPipeableStream(h(Root))
		pipe(res)
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
