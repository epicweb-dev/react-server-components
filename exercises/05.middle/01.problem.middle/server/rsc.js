// The RSC server
// This is a server to host data-local resources like databases and RSC

import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import { createElement as h } from 'react'
import { renderToPipeableStream } from 'react-server-dom-esm/server'
import { Document } from '../src/app.js'

const PORT = process.env.PORT || 3001

const app = express()

app.use(compress())

const moduleBasePath = new URL('../src', import.meta.url).href

async function renderApp(res, returnValue) {
	const shipId = '6c86fca8b9086'
	const search = ''
	const root = h(Document, { shipId, search })
	// For client-invoked server actions we refresh the tree and return a return value.
	const payload = returnValue ? { returnValue, root } : root
	const { pipe } = renderToPipeableStream(payload, moduleBasePath)
	pipe(res)
}

app.get('/', async function (req, res) {
	await renderApp(res, null)
})

const server = app.listen(PORT, () => {
	console.log(`✅ RSC: http://localhost:${PORT}`)
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
