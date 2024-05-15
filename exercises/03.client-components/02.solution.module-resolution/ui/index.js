import { Suspense, createElement as h, startTransition, use } from 'react'
import { createRoot } from 'react-dom/client'
import { createFromFetch } from 'react-server-dom-esm/client'
import { shipFallbackSrc } from './img-utils.js'

const getGlobalLocation = () =>
	window.location.pathname + window.location.search

const initialLocation = getGlobalLocation()
const initialContentFetchPromise = fetch(`/rsc${initialLocation}`)
const initialContentPromise = createFromFetch(initialContentFetchPromise, {
	moduleBaseURL: `${window.location.origin}/ui`,
})

function Root() {
	const content = use(initialContentPromise)
	return content
}

startTransition(() => {
	createRoot(document.getElementById('root')).render(
		h(
			'div',
			{ className: 'app-wrapper' },
			h(
				Suspense,
				{
					fallback: h('img', {
						style: { maxWidth: 400 },
						src: shipFallbackSrc,
					}),
				},
				h(Root),
			),
		),
	)
})
