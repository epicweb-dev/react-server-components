import {
	Suspense,
	createElement as h,
	startTransition,
	use,
	useDeferredValue,
	useEffect,
	useRef,
	useState,
	useTransition,
} from 'react'
import { createRoot } from 'react-dom/client'
import * as RSC from 'react-server-dom-esm/client'
import { contentCache, useContentCache, generateKey } from './content-cache.js'
import { ErrorBoundary } from './error-boundary.js'
import { shipFallbackSrc } from './img-utils.js'
import { RouterContext, getGlobalLocation } from './router.js'

function fetchContent(location) {
	return fetch(`/rsc${location}`)
}

// 🐨 uncomment this. We're going to reassign this function when our component
// renders, but we need it here so we can call it from outside our component.
// function updateContentKey() {
// 	console.error('updateContentKey called before it was set!')
// }

function createFromFetch(fetchPromise) {
	return RSC.createFromFetch(fetchPromise, {
		moduleBaseURL: `${window.location.origin}/js/src`,
		callServer,
	})
}

async function callServer(id, args) {
	// using the global location to avoid a stale closure over the location
	const fetchPromise = fetch(`/action${getGlobalLocation()}`, {
		method: 'POST',
		headers: { 'rsc-action': id },
		body: await RSC.encodeReply(args),
	})
	// 🐨 get the contentKey from window.history.state?.key ?? generateKey()
	// 🐨 use the onStreamFinished utility from below:
	// 💰
	// onStreamFinished(fetchPromise, () => {
	// 	🐨 when the stream is finished, call updateContentKey with the contentKey
	// })
	// 🦉 we need to wait until the stream is finished otherwise we'll update to a
	// pending state!
	const actionResponsePromise = createFromFetch(fetchPromise)
	// 🐨 use the contentKey to add the actionResponsePromise in the contentCache
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

// 💰 you're going to want this handy utility
// function onStreamFinished(fetchPromise, onFinished) {
// 	// create a promise chain that resolves when the stream is completely consumed
// 	return (
// 		fetchPromise
// 			// clone the response so createFromFetch can use it (otherwise we lock the reader)
// 			// and wait for the text to be consumed so we know the stream is finished
// 			.then(response => response.clone().text())
// 			.then(onFinished)
// 	)
// }

function Root() {
	const latestNav = useRef(null)
	const contentCache = useContentCache()
	const [nextLocation, setNextLocation] = useState(getGlobalLocation)
	const [contentKey, setContentKey] = useState(initialContentKey)
	const [isPending, startTransition] = useTransition()

	// 🐨 add a useEffect here that reassigns updateConentKey to a function that
	// accepts a newContentKey and calls setContentKey(newContentKey) in a startTransition

	const location = useDeferredValue(nextLocation)
	const contentPromise = contentCache.get(contentKey)

	useEffect(() => {
		function handlePopState() {
			const nextLocation = getGlobalLocation()
			setNextLocation(nextLocation)
			const historyKey = window.history.state?.key ?? generateKey()

			if (!contentCache.has(historyKey)) {
				const fetchPromise = fetchContent(nextLocation)
				const nextContentPromise = createFromFetch(fetchPromise)
				contentCache.set(historyKey, nextContentPromise)
			}

			// 🐨 swap this with updateContentKey
			startTransition(() => setContentKey(historyKey))
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [])

	function navigate(nextLocation, { replace = false } = {}) {
		setNextLocation(nextLocation)
		const thisNav = Symbol(`Nav for ${nextLocation}`)
		latestNav.current = thisNav

		const newContentKey = generateKey()
		const nextContentPromise = createFromFetch(
			fetchContent(nextLocation).then(response => {
				if (thisNav !== latestNav.current) return
				if (replace) {
					window.history.replaceState({ key: newContentKey }, '', nextLocation)
				} else {
					window.history.pushState({ key: newContentKey }, '', nextLocation)
				}
				return response
			}),
		)

		contentCache.set(newContentKey, nextContentPromise)
		// 🐨 swap this with updateContentKey
		startTransition(() => setContentKey(newContentKey))
	}

	return h(
		RouterContext.Provider,
		{
			value: {
				navigate,
				location,
				nextLocation,
				isPending,
			},
		},
		use(contentPromise).root,
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
