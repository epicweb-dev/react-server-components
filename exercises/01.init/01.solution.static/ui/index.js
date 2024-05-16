import { Suspense, createElement as h, startTransition, use } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app.js'
import { shipFallbackSrc } from './img-utils.js'

const getGlobalLocation = () =>
	window.location.pathname + window.location.search

const initialLocation = getGlobalLocation()
const initialDataPromise = fetch(`/api${initialLocation}`).then(r => r.json())

function Root() {
	const { shipId, search, ship, shipResults } = use(initialDataPromise)
	return h(App, { shipId, search, ship, shipResults })
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
