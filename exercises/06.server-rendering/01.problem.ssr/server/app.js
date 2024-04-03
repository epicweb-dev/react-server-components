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

// 🐨 default this to 3001 for the RSC server
const PORT = process.env.PORT || 3000
// 🐨 in the SSR server, create a RSC_PORT variable like the PORT one that defaults to 3001
// 🐨 create an RSC_ORIGIN variable that's set to new URL(`http://localhost:${RSC_PORT}`)

const app = express()
app.use(compress())

// 🐨 use these handy utilities to make streamed requests from the SSR server to the RSC server:
// 💰 you don't need it in the RSC server
// function request(options, body) {
// 	return new Promise((resolve, reject) => {
// 		const req = http.request(options, res => {
// 			resolve(res)
// 		})
// 		req.on('error', e => {
// 			reject(e)
// 		})
// 		body.pipe(req)
// 	})
// }
//
// function proxyReq(req) {
// 	return request(
// 		{
// 			host: RSC_ORIGIN.hostname,
// 			port: RSC_ORIGIN.port,
// 			method: req.method,
// 			path: req.url,
// 			headers: req.headers,
// 		},
// 		req,
// 	)
// }

// 🐨 keep this stuff in the SSR server but delete it from the RSC server 👇// this is here so the workshop app knows when the server has started
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
// 🐨 keep this stuff in the SSR server but delete it from the RSC server 👆

const moduleBasePath = new URL('../src', import.meta.url).href

// 🐨 keep renderApp stuff for the RSC server, but delete it from the SSR server
async function renderApp(res, returnValue) {
	const shipId = res.req.params.shipId || null
	const search = res.req.query.search || ''
	const data = { shipId, search }
	shipDataStorage.run(data, () => {
		// 🐨 update this to be the Document export of ../src/app.js instead of the App
		const root = h(App)
		const payload = { returnValue, root }
		const { pipe } = renderToPipeableStream(payload, moduleBasePath)
		pipe(res)
	})
}

// 🐨 in both SSR and RSC servers, remove the "/rsc" part of the URL here
// 🐨 in RSC server, don't change anything else about this handler
// 🐨 in the SSR server, we're going to server render! Follow the instructions below
app.get('/rsc/:shipId?', async (req, res) => {
	// 🦉 in the SSR server, we're non longer rendering the app. Now we need to
	// proxy this request to the RSC server.
	// 💣 delete this call to renderApp
	await renderApp(res, null)

	// 🐨 create a rscResponse object that is assigned to await proxyReq(req)
	// 🐨 create a `moduleBaseURL` set to `/js/src`

	// 🐨 create a contentPromise variable (use let, we'll assign it later)

	// 🐨 create a Root component function. Inside the component:
	//   🐨 if the the contentPromise is not assigned yet, assign it to
	//   createFromNodeStream from 'react-server-dom-esm/client'
	//   passing rscResponse, moduleBasePath, and moduleBaseURL
	//   🐨 get content from use(contentPromise)
	//   🐨 return content.root

	// 🐨 create a router context value where the location and nextLocation are
	// req.url
})

app.post('/action/:shipId?', bodyParser.text(), async (req, res) => {
	const serverReference = req.get('rsc-action')
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
	const result = await action(...args)

	await renderApp(res, result)
})

// 💣 remove this from both servers
app.get('/:shipId?', async (req, res) => {
	res.set('Content-type', 'text/html')
	return res.sendFile('index.html', { root: 'public' })
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
