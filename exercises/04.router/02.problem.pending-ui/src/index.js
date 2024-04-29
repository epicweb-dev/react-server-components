import {
	Suspense,
	createElement as h,
	startTransition,
	use,
	// 💰 you'll need this
	// useDeferredValue,
	useState,
	// 💰 you'll need this
	// useTransition,
} from 'react'
import { createRoot } from 'react-dom/client'
import * as RSC from 'react-server-dom-esm/client'
import { ErrorBoundary } from './error-boundary.js'
import { shipFallbackSrc } from './img-utils.js'
import { RouterContext, getGlobalLocation } from './router.js'

function fetchContent(location) {
	return fetch(`/rsc${location}`)
}

function createFromFetch(fetchPromise) {
	return RSC.createFromFetch(fetchPromise, {
		moduleBaseURL: `${window.location.origin}/js/src`,
	})
}

const initialLocation = getGlobalLocation()
const initialContentPromise = createFromFetch(fetchContent(initialLocation))

function Root() {
	// 🐨 change this to nextLocation
	const [location, setLocation] = useState(initialLocation)
	const [contentPromise, setContentPromise] = useState(initialContentPromise)
	// 🐨 call useTransition here to get isPending and startTransition

	// 🐨 create a location variable set to useDeferredValue of the nextLocation

	function navigate(nextLocation, { replace = false } = {}) {
		setLocation(nextLocation)

		const nextContentPromise = createFromFetch(
			fetchContent(nextLocation).then(response => {
				if (replace) {
					window.history.replaceState({}, '', nextLocation)
				} else {
					window.history.pushState({}, '', nextLocation)
				}
				return response
			}),
		)

		startTransition(() => setContentPromise(nextContentPromise))
	}

	return h(
		RouterContext,
		{
			value: {
				navigate,
				location,
				// 🐨 add the nextLocation and isPending to this context value
			},
		},
		use(contentPromise),
	)
}

startTransition(() => {
	createRoot(document.getElementById('root')).render(
		h(
			'div',
			{ className: 'app-wrapper' },
			h(
				ErrorBoundary,
				{
					fallback: h(
						'div',
						{ className: 'app-error' },
						h('p', null, 'Something went wrong!'),
					),
				},
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
		),
	)
})
