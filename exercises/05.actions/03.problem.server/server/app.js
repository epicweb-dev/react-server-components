// 💰 you'll need these
// import bodyParser from 'body-parser'
// import busboy from 'busboy'
import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import { createElement as h } from 'react'
import {
	renderToPipeableStream,
	// 💰 you'll need this
	// decodeReplyFromBusboy,
} from 'react-server-dom-esm/server'
import { App } from '../src/app.js'
import { shipDataStorage } from './async-storage.js'

const PORT = process.env.PORT || 3000

const app = express()
app.use(compress())
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

const moduleBasePath = new URL('../src', import.meta.url).href

// 🐨 add a returnValue argument here
async function renderApp(res) {
	try {
		const shipId = res.req.params.shipId || null
		const search = res.req.query.search || ''
		const data = { shipId, search }
		shipDataStorage.run(data, () => {
			const root = h(App)
			// 🐨 change the payload to an object that has { root, returnValue }
			// 🦉 this will break the app until you update the src/index.js file!
			const payload = root
			const { pipe } = renderToPipeableStream(payload, moduleBasePath)
			pipe(res)
		})
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: error.message })
	}
}

app.get('/rsc/:shipId?', async (req, res) => {
	await renderApp(res)
})

// 🐨 add a app.post to handle POST requests to /action/:shipId? that uses bodyParser
// 💰 This isn't an express workshop, so this'll get you started:
// app.post('/action/:shipId?', bodyParser.text(), async (req, res) => {})
// 🐨 in the body of the POST handler, you'll want to:
// 1. get the serverReference from the rsc-action header
// 2. split the serverReference by '#' to get the filepath and export name
// 3. dynamically import the action from the filepath and name
//    💰 (await import(filepath))[name]
// 💯 Bonus: validate the action is a valid server reference. console.log(action.$$typeof) to see how you might determine that
// 4. parse the args: 💰
// 		const bb = busboy({ headers: req.headers })
// 		const reply = decodeReplyFromBusboy(bb, moduleBasePath)
// 		req.pipe(bb)
// 		const args = await reply
// 5. call the action with the ...args
// 6. call renderApp with the res and the returnValue of the action

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
