'use client'

import {
	createElement as h,
	startTransition,
	use,
	useDeferredValue,
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

let callServer

const initialLocation = getGlobalLocation()
const initialContentPromise = RSC.createFromFetch(
	fetchContent(initialLocation),
	{ moduleBaseURL, callServer: (id, args) => callServer?.(id, args) },
)

function generateKey() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const contentCache = new Map()
let initialContentKey = window.history.state?.key
if (!initialContentKey) {
	initialContentKey = generateKey()
	window.history.replaceState({ key: initialContentKey }, '')
}
contentCache.set(initialContentKey, initialContentPromise)

export function Root() {
	const latestNav = useRef(null)
	const [nextLocation, setNextLocation] = useState(getGlobalLocation)
	const [contentKey, setContentKey] = useState(initialContentKey)
	const [isPending, startTransition] = useTransition()

	const location = useDeferredValue(nextLocation)
	const contentPromise = contentCache.get(contentKey)

	useEffect(() => {
		function handlePopState() {
			const key = window.history.state?.key
			const contentPromise = key ? contentCache.get(key) : null
			if (contentPromise) {
				startTransition(() => setContentKey(key))
			} else {
				navigate(getGlobalLocation(), { updateHistory: false })
			}
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [])

	callServer = async function callServer(id, args) {
		const fetchPromise = fetch(location, {
			method: 'POST',
			headers: { Accept: 'text/x-component', 'rsc-action': id },
			body: await RSC.encodeReply(args),
		})
		const actionResponsePromise = createFromFetch(fetchPromise)
		const newContentKey = generateKey()
		contentCache.set(newContentKey, actionResponsePromise)
		startTransition(() => {
			setContentKey(newContentKey)
		})
		const { returnValue } = await actionResponsePromise
		return returnValue
	}

	function createFromFetch(fetchPromise) {
		return RSC.createFromFetch(fetchPromise, { moduleBaseURL, callServer })
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

		const newContentKey = generateKey()
		const nextContentPromise = createFromFetch(
			fetchContent(nextLocation).then(response => {
				if (thisNav !== latestNav.current) return
				const newLocation = response.headers.get('x-location')
				if (updateHistory) {
					if (replace) {
						window.history.replaceState({ key: newContentKey }, '', newLocation)
					} else {
						window.history.pushState({ key: newContentKey }, '', newLocation)
					}
				}
				return response
			}),
		)

		contentCache.set(newContentKey, nextContentPromise)
		startTransition(() => {
			setContentKey(newContentKey)
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
