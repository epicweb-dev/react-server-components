import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
// 🐨 you're gonna want these
// import { renderToPipeableStream } from 'react-dom/server'
// import { getShip, searchShips } from '../db/ship-api.js'
// import { Document } from '../src/app.js'

const PORT = process.env.PORT || 3000

const app = express()

app.use(compress())

app.head('/', (req, res) => {
	res.status(200).end()
})

app.get('/', async function (req, res) {
	try {
		// 💣 delete this first
		throw new Error('not implemented yet')

		// 🐨 create a variable for the shipId ('6c86fca8b9086') and search ('')
		// 🐨 get the ship using getShip and shipResults from searchShips
		// 🐨 set the response Content-Type header to 'text/html'
		// 📜 https://expressjs.com/en/api.html#res.set
		// 🐨 call renderToPipeableStream from react-dom/server with the Document element
		//    while passing the shipId, search, ship, and shipResults as props
		//    💰 remember, we don't have JSX in this workshop since this is an
		//    uncompiled JavaScript file, so you'll need to use `createElement`.
		// 📜 https://react.dev/reference/react-dom/server/renderToPipeableStream
		// 🐨 with the returned object from renderToPipeableStream, call pipe(res)
		// to pipe the streamed output into the response object
		// 📜 https://react.dev/reference/react-dom/server/renderToPipeableStream#rendering-a-react-tree-as-html-to-a-nodejs-stream
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
