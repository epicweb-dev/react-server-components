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
	// 💰 you'll need this
	// decodeReply,
} from 'react-server-dom-esm/server'
import { App } from '../ui/app.js'
import { shipDataStorage } from './async-storage.js'

const PORT = process.env.PORT || 3000

const app = new Hono({ strict: true })
app.use(trimTrailingSlash())

app.use('/*', serveStatic({ root: './public', index: '' }))

app.use(
	'/ui/*',
	serveStatic({
		root: './ui',
		onNotFound: (path, context) => context.text('File not found', 404),
		rewriteRequestPath: (path) => path.replace('/ui', ''),
	}),
)

// This just cleans up the URL if the search ever gets cleared... Not important
// for RSCs... Just ... I just can't help myself. I like URLs clean.
app.use(async (context, next) => {
	if (context.req.query('search') === '') {
		const url = new URL(context.req.url)
		const searchParams = new URLSearchParams(url.search)
		searchParams.delete('search')
		const location = [url.pathname, searchParams.toString()]
			.filter(Boolean)
			.join('?')
		return context.redirect(location, 302)
	} else {
		await next()
	}
})

const moduleBasePath = new URL('../ui', import.meta.url).href

// 🐨 add a returnValue argument here
async function renderApp(context) {
	const shipId = context.req.param('shipId') || null
	const search = context.req.query('search') || ''
	const data = { shipId, search }
	shipDataStorage.run(data, () => {
		const root = h(App)
		// 🐨 change the payload to an object that has { root, returnValue }
		// 🦉 this will break the app until you update the ui/index.js file!
		const payload = root
		const { pipe } = renderToPipeableStream(payload, moduleBasePath)
		pipe(context.env.outgoing)
	})
	return RESPONSE_ALREADY_SENT
}

app.get('/rsc/:shipId?', async (context) => await renderApp(context))

// 🐨 add an app.post to handle POST requests to /action/:shipId?
// 💰 This isn't a hono.js workshop, so this'll get you started:
// app.post('/action/:shipId?', async context => {})
// 🐨 in the body of the POST handler, you'll want to:
// 1. get the serverReference from the rsc-action header (💰 context.req.header('rsc-action'))
// 2. split the serverReference by '#' to get the filepath and export name
// 3. dynamically import the action from the filepath and name
//    💰 (await import(filepath))[name]
// 💯 Bonus: validate the action is a valid server reference. console.log(action.$$typeof) to see how you might determine that
// 4. get the formData object from the quest (💰 await context.req.formData())
// 5. decode the reply from the formData object (await decodeReply(formData, moduleBasePath))
// 6. call the action with the ...args
// 7. call renderApp with the context and the returnValue of the action

app.get('/:shipId?', async (context) => {
	const html = await readFile('./public/index.html', 'utf8')
	return context.html(html, 200)
})

app.onError((err, context) => {
	console.error('error', err)
	return context.json({ error: true, message: 'Something went wrong' }, 500)
})

const server = serve({ fetch: app.fetch, port: PORT }, (info) => {
	const url = `http://localhost:${info.port}`
	console.log(`🚀  We have liftoff!\n${url}`)
})

closeWithGrace(async ({ signal, err }) => {
	if (err) console.error('Shutting down server due to error', err)
	else console.log('Shutting down server due to signal', signal)

	await new Promise((resolve) => server.close(resolve))
	process.exit()
})
