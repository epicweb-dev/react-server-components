import closeWithGrace from 'close-with-grace'
import compress from 'compression'
import express from 'express'
import { createElement as h } from 'react'
import { renderToPipeableStream } from 'react-server-dom-esm/server'
import { Document } from '../src/app.js'
import { shipDataStorage } from './async-storage.js'

const PORT = process.env.PORT || 3001

const app = express()

app.use(compress())

const moduleBasePath = new URL('../src', import.meta.url).href

async function renderApp(res) {
	const shipId = '6c86fca8b9086'
	const search = ''
	shipDataStorage.run({ shipId, search }, () => {
		const root = h(Document)
		const { pipe } = renderToPipeableStream(root, moduleBasePath)
		pipe(res)
	})
}

app.get('/', async function (req, res) {
	await renderApp(res)
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
