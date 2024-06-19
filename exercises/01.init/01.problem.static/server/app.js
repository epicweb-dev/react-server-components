// 💰 you're gonna need this
// import { readFile } from 'fs/promises'
import { serve } from '@hono/node-server'
// 💰 you're gonna need this
// import { serveStatic } from '@hono/node-server/serve-static'
import closeWithGrace from 'close-with-grace'
import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'
// 💰 you're gonna need these:
// import { getShip, searchShips } from '../db/ship-api.js'

const PORT = process.env.PORT || 3000

const app = new Hono({ strict: true })
app.use(trimTrailingSlash())

// 🐨 add a static hono.js handler for the public folder, but leave out the index.html
// 💰 app.use('/*', serveStatic({ root: './public', index: '' }))

// 🐨 add a handler for requests to '/ui' that serves static files from 'ui'
// 💰
// app.use(
// 	'/ui/*',
// 	serveStatic({
// 		root: './ui',
// 		onNotFound: (path, context) => context.text('File not found', 404),
// 		rewriteRequestPath: path => path.replace('/ui', ''),
// 	}),
// )

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

// 🐨 add an API endpoint to get data for our page:
// 💰
// app.get('/api/:shipId?', async context => {
// 	const shipId = context.req.param('shipId') || null
// 	const search = context.req.query('search') || ''
// 	const ship = shipId ? await getShip({ shipId }) : null
// 	const shipResults = await searchShips({ search })
// 	const data = { shipId, search, ship, shipResults }
// 	return context.json(data)
// })

// 🐨 add a handler for '/:shipId?' which means the ship is optional
// 🐨 set the response Content-type to 'text/html' and send the file in public called index.html
// 💰
// app.get('/:shipId?', async context => {
// 	const html = await readFile('./public/index.html', 'utf8')
// 	return context.html(html, 200)
// })

app.onError((err, context) => {
	console.error('error', err)
	return context.json({ error: true, message: 'Something went wrong' }, 500)
})

const server = serve({ fetch: app.fetch, port: PORT }, info => {
	const url = `http://localhost:${info.port}`
	console.log(`🚀  We have liftoff!\n${url}`)
})

closeWithGrace(async ({ signal, err }) => {
	if (err) console.error('Shutting down server due to error', err)
	else console.log('Shutting down server due to signal', signal)

	await new Promise(resolve => server.close(resolve))
	process.exit()
})
