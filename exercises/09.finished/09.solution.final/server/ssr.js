// This is a server to host CDN distributed resources like module source files and SSR

import http from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'
import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { createFromNodeStream } from 'react-server-dom-esm/client'

const moduleBasePath = new URL('../src', import.meta.url).href

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

app.head('/', async (req, res) => {
	res.status(200).end()
})

app.all('/', async function (req, res) {
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
	if (req.get('rsc-action')) {
		proxiedHeaders['rsc-action'] = req.get('rsc-action')
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

	if (req.accepts('text/html')) {
		try {
			const rscResponse = await promiseForData
			const moduleBaseURL = '/src'

			// For HTML, we're a "client" emulator that runs the client code,
			// so we start by consuming the RSC payload. This needs the local file path
			// to load the source files from as well as the URL path for preloads.

			let root
			function Root() {
				root ??= createFromNodeStream(
					rscResponse,
					moduleBasePath,
					moduleBaseURL,
				)
				return React.use(root)
			}
			// Render it into HTML by resolving the client components
			res.set('Content-type', 'text/html')
			const { pipe } = renderToPipeableStream(React.createElement(Root), {
				importMap: {
					imports: {
						react: 'https://esm.sh/react@experimental?pin=v125&dev',
						'react-dom': 'https://esm.sh/react-dom@experimental?pin=v125&dev',
						'react-dom/': 'https://esm.sh/react-dom@experimental&pin=v125&dev/',
						'react-error-boundary':
							'https://esm.sh/react-error-boundary@4.0.12?pin=124&dev',
						'react-server-dom-esm/client': '/react-server-dom-esm/client',
					},
				},
				bootstrapModules: ['/src/index.js'],
			})
			pipe(res)
		} catch (e) {
			console.error(`Failed to SSR: ${e.stack}`)
			res.statusCode = 500
			res.end()
		}
	} else {
		try {
			const rscResponse = await promiseForData

			// For other request, we pass-through the RSC payload.
			if (req.get('rsc-action')) {
				res.set('Content-type', 'text/x-component')
			}

			rscResponse.on('data', data => {
				res.write(data)
				res.flush()
			})
			rscResponse.on('end', () => {
				res.end()
			})
		} catch (e) {
			console.error(`Failed to proxy request: ${e.stack}`)
			res.statusCode = 500
			res.end()
		}
	}
})

app.use(express.static('public'))
app.use('/src', express.static('src'))
app.use('/react-server-dom-esm/client', (req, res) => {
	const require = createRequire(import.meta.url)
	const pkgPath = require.resolve('react-server-dom-esm')
	const modulePath = path.join(
		path.dirname(pkgPath),
		'esm',
		'react-server-dom-esm-client.browser.development.js',
	)
	res.sendFile(modulePath)
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
