import {
	Suspense,
	createElement as h,
	startTransition,
	use,
	useDeferredValue,
	useState,
	useTransition,
} from 'react'
import { createRoot } from 'react-dom/client'
import * as RSC from 'react-server-dom-esm/client'
import { ErrorBoundary } from './error-boundary.js'
import { shipFallbackSrc } from './img-utils.js'
import { RouterContext, getGlobalLocation, useLinkHandler } from './router.js'

function fetchContent(location) {
	return fetch(`/rsc${location}`)
}

function createFromFetch(fetchPromise) {
	return RSC.createFromFetch(fetchPromise, {
		moduleBaseURL: `${window.location.origin}/ui`,
	})
}

const initialLocation = getGlobalLocation()
const initialContentPromise = createFromFetch(fetchContent(initialLocation))

function Root() {
	const [nextLocation, setNextLocation] = useState(getGlobalLocation)
	const [contentPromise, setContentPromise] = useState(initialContentPromise)
	const [isPending, startTransition] = useTransition()

	const location = useDeferredValue(nextLocation)

	const navigateType = useRef()

	useEffect(() => {
		if (location === nextLocation && getGlobalLocation() !== nextLocation) {
			if (navigateType.current) {
				window.history.replaceState({}, '', nextLocation)
			} else {
				window.history.pushState({}, '', nextLocation)
			}
		}
	}, [location, nextLocation])

	function navigate(nextLocation, { replace = false } = {}) {
		setNextLocation(nextLocation)
		navigateType.current = replace
		const nextContentPromise = createFromFetch(fetchContent(nextLocation))

		startTransition(() => setContentPromise(nextContentPromise))
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
