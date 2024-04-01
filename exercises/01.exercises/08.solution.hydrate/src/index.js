// We don't need 'use client' on this file because the RSC server never imports
// it anyway. It's only used as a bootstrap module for the client.
// 'use client'

import { createElement as h, startTransition, use } from 'react'
import { hydrateRoot } from 'react-dom/client'
import * as RSC from 'react-server-dom-esm/client'

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

function Root() {
	return use(initialContentPromise).root
}

startTransition(() => {
	hydrateRoot(document, h(Root))
})
