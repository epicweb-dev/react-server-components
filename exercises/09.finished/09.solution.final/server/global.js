// This is a server to host CDN distributed resources like module source files and SSR

import { createRequire } from 'node:module'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import http from 'node:http'
import compress from 'compression'
import chalk from 'chalk'
import express from 'express'
import React from 'react'
import closeWithGrace from 'close-with-grace'

import { renderToPipeableStream } from 'react-dom/server'
import { createFromNodeStream } from 'react-server-dom-esm/client'

const moduleBasePath = new URL('../src', import.meta.url).href

const PORT = process.env.PORT || 3000
const REGION_PORT = process.env.REGION_PORT || 3001
const API_ORIGIN = new URL(
	process.env.API_ORIGIN || `http://localhost:${REGION_PORT}`,
)

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

app.all('/', async function (req, res, next) {
	// Proxy the request to the regional server.
	const proxiedHeaders = {
		'X-Forwarded-Host': req.hostname,
		'X-Forwarded-For': req.ips,
		'X-Forwarded-Port': PORT,
		'X-Forwarded-Proto': req.protocol,
	}
	// Proxy other headers as desired.
	if (req.get('rsc-action')) {
		proxiedHeaders['Content-type'] = req.get('Content-type')
		proxiedHeaders['rsc-action'] = req.get('rsc-action')
	} else if (req.get('Content-type')) {
		proxiedHeaders['Content-type'] = req.get('Content-type')
	}

	const promiseForData = request(
		{
			host: API_ORIGIN.hostname,
			port: API_ORIGIN.port,
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
			rscResponse.on('end', data => {
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
app.use('/react-server-dom-esm/client', (req, res, next) => {
	const require = createRequire(import.meta.url)
	const pkgPath = require.resolve('react-server-dom-esm')
	const modulePath = path.join(
		path.dirname(pkgPath),
		'esm',
		'react-server-dom-esm-client.browser.development.js',
	)
	res.sendFile(modulePath)
})

app.listen(PORT, () => {
	console.log(`✅ SSR: http://localhost:${PORT}`)
})

app.on('error', function (error) {
	if (error.syscall !== 'listen') {
		throw error
	}

	switch (error.code) {
		case 'EACCES':
			console.error('port 3000 requires elevated privileges')
			process.exit(1)
			break
		case 'EADDRINUSE':
			console.error('Port 3000 is already in use')
			process.exit(1)
			break
		default:
			throw error
	}
})

closeWithGrace(async () => {
	console.log('Shutting down server...')
	app.close()
})
