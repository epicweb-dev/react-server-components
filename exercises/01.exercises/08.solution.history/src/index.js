import {
	Suspense,
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
import { createRoot } from 'react-dom/client'
import * as RSC from 'react-server-dom-esm/client'
import { ErrorBoundary } from './error-boundary.js'
import { shipFallbackSrc } from './img-utils.js'
import { RouterContext, getGlobalLocation } from './router.js'

function fetchContent(location) {
	return fetch(`/rsc${location}`)
}

function generateKey() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const contentCache = new Map()

function createFromFetch(fetchPromise) {
	return RSC.createFromFetch(fetchPromise, { moduleBaseURL: '/js/src' })
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
			.then(response => response.clone().text())
			.then(onFinished)
	)
}

function Root() {
	const [, forceRender] = useReducer(() => Symbol(), Symbol())
	const latestNav = useRef(null)
	const [nextLocation, setNextLocation] = useState(getGlobalLocation)
	const [contentKey, setContentKey] = useState(initialContentKey)
	const [isPending, startTransition] = useTransition()

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
			onStreamFinished(fetchPromise, () => {
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

			startTransition(() => {
				setContentKey(historyKey)
				forceRender()
			})
		}
		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [])

	function navigate(nextLocation, { replace = false } = {}) {
		setNextLocation(nextLocation)
		const thisNav = Symbol()
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
		startTransition(() => setContentKey(newContentKey))
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
