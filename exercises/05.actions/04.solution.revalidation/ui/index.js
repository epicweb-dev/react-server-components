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
import { RouterContext, getGlobalLocation, useLinkHandler } from './router.js'

function fetchContent(location) {
	return fetch(`/rsc${location}`)
}

function updateContentKey() {
	console.error('updateContentKey called before it was set!')
}

function createFromFetch(fetchPromise) {
	return RSC.createFromFetch(fetchPromise, {
		moduleBaseURL: `${window.location.origin}/ui`,
		callServer,
	})
}

async function callServer(id, args) {
	const fetchPromise = fetch(`/action${getGlobalLocation()}`, {
		method: 'POST',
		headers: { 'rsc-action': id },
		body: await RSC.encodeReply(args),
	})
	const contentKey = window.history.state?.key ?? generateKey()
	onStreamFinished(fetchPromise, () => {
		updateContentKey(contentKey)
	})
	const actionResponsePromise = createFromFetch(fetchPromise)
	contentCache.set(contentKey, actionResponsePromise)
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

function onStreamFinished(fetchPromise, onFinished) {
	// create a promise chain that resolves when the stream is completely consumed
	return (
		fetchPromise
			// clone the response so createFromFetch can use it (otherwise we lock the reader)
			// and wait for the text to be consumed so we know the stream is finished
			.then((response) => response.clone().text())
			.then(onFinished)
	)
}

function Root() {
	const latestNav = useRef(null)
	const contentCache = useContentCache()
	const [nextLocation, setNextLocation] = useState(getGlobalLocation)
	const [contentKey, setContentKey] = useState(initialContentKey)
	const [isPending, startTransition] = useTransition()

	// set the updateContentKey function in a useEffect to avoid issues with
	// concurrent rendering (useDeferredValue will create throw-away renders).
	useEffect(() => {
		updateContentKey = (newContentKey) => {
			startTransition(() => setContentKey(newContentKey))
		}
	}, [])

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

			updateContentKey(historyKey)
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [contentCache])

	function navigate(nextLocation, { replace = false } = {}) {
		setNextLocation(nextLocation)
		const thisNav = Symbol(`Nav for ${nextLocation}`)
		latestNav.current = thisNav

		const newContentKey = generateKey()
		const nextContentPromise = createFromFetch(
			fetchContent(nextLocation).then((response) => {
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
		updateContentKey(newContentKey)
	}

	useLinkHandler(navigate)

	return h(
		RouterContext,
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
