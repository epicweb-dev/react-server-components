'use client'

import { Fragment, Suspense, createElement as h } from 'react'
import { ErrorBoundary } from './error-boundary.js'

export function ShipSearch({ search, results, fallback }) {
	// 🐨 get the navigate function and location from useRouter()
	return h(
		Fragment,
		null,
		h(
			'form',
			// 🐨 add a submit handler here to prevent the default full page refresh
			{},
			h('input', {
				placeholder: 'Filter ships...',
				type: 'search',
				defaultValue: search,
				name: 'search',
				autoFocus: true,
				// 🐨 add an onChange handler so we can update the search in the URL
				// 🐨 use the mergeLocationState utility to create a newLocation that
				// copies the state from the current location with an updated search value
				// 🐨 navigate to the newLocation and set the replace option to true
			}),
		),
		h(
			ErrorBoundary,
			{ fallback: ShipResultsErrorFallback },
			h('ul', null, h(Suspense, { fallback }, results)),
		),
	)
}

// 💣 you can remove the search prop here now that we can use the location from
// the router
export function SelectShipLink({ shipId, search, highlight, children }) {
	// 🐨 get the current location from useRouter

	// 🦉 the useLinkHandler you'll add in ui/index.js will set up an event handler
	// to listen to clicks to anchor elements and navigate properly.

	// right now we're merging manually, but now you can use our
	// mergeLocationState utility.
	// 🐨 update href to be mergeLocationState(location, { shipId })
	const href = [
		`/${shipId}`,
		search ? `search=${encodeURIComponent(search)}` : null,
	]
		.filter(Boolean)
		.join('?')
	return h('a', {
		children,
		href,
		style: { fontWeight: highlight ? 'bold' : 'normal' },
	})
}

export function ShipResultsErrorFallback() {
	return h(
		'div',
		{ style: { padding: 6, color: '#CD0DD5' } },
		'There was an error retrieving results',
	)
}
