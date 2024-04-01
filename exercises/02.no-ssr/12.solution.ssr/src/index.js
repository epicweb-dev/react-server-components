import {
	createElement as h,
	startTransition,
	use,
	useDeferredValue,
	useEffect,
	useReducer,
	useRef,
	useState,
	useTransition,
} from 'react'
import { hydrateRoot } from 'react-dom/client'
import * as RSC from 'react-server-dom-esm/client'
import { RouterContext } from './router.js'

const getGlobalLocation = () =>
	window.location.pathname + window.location.search

function fetchContent(location) {
	return fetch(location, { headers: { Accept: 'text/x-component' } })
}

const moduleBaseURL = '/js/src'

function generateKey() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function updateContentKey() {
	console.error('updateContentKey called before it was set!')
}
const contentCache = new Map()

function createFromFetch(fetchPromise) {
	return RSC.createFromFetch(fetchPromise, { moduleBaseURL, callServer })
}

async function callServer(id, args) {
	// using the global location to avoid a stale closure over the location
	const fetchPromise = fetch(getGlobalLocation(), {
		method: 'POST',
		headers: { Accept: 'text/x-component', 'rsc-action': id },
		body: await RSC.encodeReply(args),
	})
	const actionResponsePromise = createFromFetch(fetchPromise)
	const newContentKey = generateKey()
	contentCache.set(newContentKey, actionResponsePromise)
	updateContentKey(newContentKey)
	const { returnValue } = await actionResponsePromise
	return returnValue
}

const initialLocation = getGlobalLocation()
const initialContentPromise = createFromFetch(fetchContent(initialLocation))

let initialContentKey = window.history.state?.key
if (!initialContentKey) {
	initialContentKey = generateKey()
	window.history.replaceState({ key: initialContentKey }, '')
}
contentCache.set(initialContentKey, initialContentPromise)

function Root() {
	const [, forceRender] = useReducer(() => Symbol(), Symbol())
	const latestNav = useRef(null)
	const [nextLocation, setNextLocation] = useState(getGlobalLocation)
	const [contentKey, setContentKey] = useState(initialContentKey)
	const [isPending, startTransition] = useTransition()

	// update the updateContentKey function to the latest every render
	useEffect(() => {
		updateContentKey = newContentKey => {
			startTransition(() => setContentKey(newContentKey))
		}
	})

	const location = useDeferredValue(nextLocation)
	const contentPromise = contentCache.get(contentKey)

	useEffect(() => {
		function handlePopState() {
			const nextLocation = getGlobalLocation()
			setNextLocation(nextLocation)
			const historyKey = window.history.state?.key ?? generateKey()

			const thisNav = Symbol(`Nav for ${historyKey}`)
			latestNav.current = thisNav

			let nextContentPromise
			const fetchPromise = fetchContent(nextLocation)
			// create a promise chain that resolves when the stream is completely consumed
			fetchPromise
				// clone the response so createFromFetch can use it (otherwise we lock the reader)
				// and wait for the text to be consumed so we know the stream is finished
				.then(response => response.clone().text())
				.then(() => {
					contentCache.set(historyKey, nextContentPromise)
					if (thisNav === latestNav.current) {
						// trigger a rerender now that the updated content is in the cache
						startTransition(() => forceRender())
					}
				})
			nextContentPromise = createFromFetch(fetchPromise)

			if (!contentCache.has(historyKey)) {
				// if we don't have this key in the cache already, set it now
				contentCache.set(historyKey, nextContentPromise)
			}

			updateContentKey(historyKey)
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [])

	function navigate(nextLocation, { replace = false, contentKey } = {}) {
		setNextLocation(nextLocation)
		const thisNav = Symbol()
		latestNav.current = thisNav

		const newContentKey = contentKey ?? generateKey()
		const nextContentPromise = createFromFetch(
			fetchContent(nextLocation).then(response => {
				if (thisNav !== latestNav.current) return
				const newLocation = response.headers.get('x-location')
				if (replace) {
					window.history.replaceState({ key: newContentKey }, '', newLocation)
				} else {
					window.history.pushState({ key: newContentKey }, '', newLocation)
				}
				return response
			}),
		)

		contentCache.set(newContentKey, nextContentPromise)
		updateContentKey(newContentKey)
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
	hydrateRoot(document, h(Root))
})
