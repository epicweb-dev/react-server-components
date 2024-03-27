import { createElement as h, startTransition, use } from 'react'
import ReactDOM from 'react-dom/client'
import { createFromFetch } from 'react-server-dom-esm/client'

const moduleBaseURL = '/js/src'

// to avoid having to do this fetch to hydrate the app, you can use this:
// https://github.com/devongovett/rsc-html-stream
const initialSerializedJsxPromise = refresh()

async function refresh() {
	const root = await createFromFetch(
		fetch('/', { headers: { Accept: 'text/x-component' } }),
		{ moduleBaseURL },
	)
	return root
}

function Shell() {
	const root = use(initialSerializedJsxPromise)
	return root
}

await initialSerializedJsxPromise

startTransition(() => {
	ReactDOM.hydrateRoot(document, h(Shell))
})
