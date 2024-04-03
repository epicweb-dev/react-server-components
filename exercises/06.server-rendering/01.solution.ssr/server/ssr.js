import http from 'node:http'
import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import { createElement as h, use } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { createFromNodeStream } from 'react-server-dom-esm/client'
import { RouterContext } from '../src/router.js'

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

function proxyReq(req, path = req.url) {
	return request(
		{
			host: RSC_ORIGIN.hostname,
			port: RSC_ORIGIN.port,
			method: req.method,
			path,
			headers: req.headers,
		},
		req,
	)
}
// this is here so the workshop app knows when the server has started
app.head('/', (req, res) => res.status(200).end())

app.use(express.static('public', { index: false }))
app.use('/js/src', express.static('src'))

// This just cleans up the URL if the search ever gets cleared... Not important
// for RSCs... Just ... I just can't help myself. I like URLs clean.
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

app.get('/rsc/:shipId?', async (req, res) => {
	try {
		const rscResponse = await proxyReq(req)

		// Forward all headers from the RSC response to the client response
		Object.entries(rscResponse.headers).forEach(([header, value]) => {
			res.set(header, value)
		})

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
		res.end(`Failed to proxy request: ${e.stack}`)
	}
})

app.post('/action/:shipId?', async (req, res) => {
	try {
		const rscResponse = await proxyReq(req)

		// Forward all headers from the RSC response to the client response
		Object.entries(rscResponse.headers).forEach(([header, value]) => {
			res.set(header, value)
		})

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
		res.end(`Failed to proxy request: ${e.stack}`)
	}
})

app.get('/:shipId?', async (req, res) => {
	try {
		const rscResponse = await proxyReq(req, `/rsc${req.url}`)
		const moduleBasePath = new URL('../src', import.meta.url).href
		const moduleBaseURL = '/js/src'

		let contentPromise
		function Root() {
			contentPromise ??= createFromNodeStream(
				rscResponse,
				moduleBasePath,
				moduleBaseURL,
			)
			const content = use(contentPromise)
			return content.root
		}
		const location = req.url
		const routerValue = {
			location,
			nextLocation: location,
			navigate() {
				throw new Error('navigate cannot be called on the server')
			},
			isPending: false,
		}
		const { pipe } = renderToPipeableStream(
			h(RouterContext.Provider, { value: routerValue }, h(Root)),
			{
				bootstrapModules: ['/js/src/index.js'],
				importMap: {
					imports: {
						react:
							'https://esm.sh/react@0.0.0-experimental-2b036d3f1-20240327?pin=v126&dev',
						'react-dom':
							'https://esm.sh/react-dom@0.0.0-experimental-2b036d3f1-20240327?pin=v126&dev',
						'react-dom/':
							'https://esm.sh/react-dom@0.0.0-experimental-2b036d3f1-20240327&pin=v126&dev/',
						'react-error-boundary':
							'https://esm.sh/react-error-boundary@4.0.13?pin=126&dev',
						'react-server-dom-esm/client': '/js/react-server-dom-esm/client',
					},
				},
			},
		)
		pipe(res)
	} catch (e) {
		console.error(`Failed to SSR: ${e.stack}`)
		res.statusCode = 500
		res.end(`Failed to SSR: ${e.stack}`)
	}
})

const server = app.listen(PORT, () => {
	console.log(`🚀  We have liftoff!`)
	console.log(`http://localhost:${PORT}`)
})

closeWithGrace(async ({ signal, err }) => {
	if (err) console.error('Shutting down server due to error', err)
	else console.log('Shutting down server due to signal', signal)

	await new Promise(resolve => server.close(resolve))
	process.exit()
})
