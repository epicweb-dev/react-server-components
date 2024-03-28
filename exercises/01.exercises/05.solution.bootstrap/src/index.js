'use client'

import {
	createElement as h,
	startTransition,
	use,
	useEffect,
	useRef,
	useState,
	useTransition,
} from 'react'
import ReactDOM from 'react-dom/client'
import * as RSC from 'react-server-dom-esm/client'
import { RouterContext } from './router.js'

const getGlobalLocation = () =>
	window.location.pathname + window.location.search

function fetchContent(location) {
	return fetch(location, { headers: { Accept: 'text/x-component' } })
}

const moduleBaseURL = '/js/src'

const initialLocation = getGlobalLocation()
const initialContentPromise = RSC.createFromFetch(
	fetchContent(initialLocation),
	{ moduleBaseURL },
)

export function Root() {
	const latestNav = useRef(null)
	const [location, setLocation] = useState(getGlobalLocation)
	const [nextLocation, setNextLocation] = useState(location)
	const [contentPromise, setContentPromise] = useState(initialContentPromise)
	const [isPending, startTransition] = useTransition()

	useEffect(() => {
		// once the transition has completed, we can update the current location
		if (!isPending) setLocation(nextLocation)
	}, [isPending])

	useEffect(() => {
		function handlePopState() {
			navigate(getGlobalLocation(), { updateHistory: false })
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [])

	function createFromFetch(fetchPromise) {
		return RSC.createFromFetch(fetchPromise, { moduleBaseURL })
	}

	async function navigate(
		nextLocation,
		{ updateHistory = true, replace = false } = {},
	) {
		if (updateHistory) {
			setNextLocation(nextLocation)
		}
		const thisNav = Symbol()
		latestNav.current = thisNav

		const nextContentPromise = createFromFetch(
			fetchContent(nextLocation).then(response => {
				if (thisNav !== latestNav.current) return
				const newLocation = response.headers.get('x-location')
				if (updateHistory) {
					if (replace) {
						window.history.replaceState(null, '', newLocation)
					} else {
						window.history.pushState(null, '', newLocation)
					}
				}
				return response
			}),
		)

		startTransition(() => {
			setContentPromise(nextContentPromise)
		})
	}

	return h(
		RouterContext.Provider,
		{
			value: {
				location,
				nextLocation: isPending ? nextLocation : location,
				navigate,
				isPending,
			},
		},
		use(contentPromise).root,
	)
}

startTransition(() => {
	ReactDOM.hydrateRoot(document, h(Root))
})
