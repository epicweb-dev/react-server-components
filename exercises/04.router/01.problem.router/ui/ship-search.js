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

export function SelectShipLink({ shipId, highlight, children }) {
	// 🐨 get the current location and navigate from useRouter
	return h('a', {
		children,
		href: `/${shipId}`,
		style: { fontWeight: highlight ? 'bold' : 'normal' },
		// 🐨 add an onClick handler and prevent default on the event (💰 event.preventDefault())
		// 🐨 create a newLocation using the mergeLocation utility and set the shipId
		// 🐨 call navigate with the newLocation
		// 💯 don't prevent the default behavior if the user's trying to open a new tab/window
	})
}

export function ShipResultsErrorFallback() {
	return h(
		'div',
		{ style: { padding: 6, color: '#CD0DD5' } },
		'There was an error retrieving results',
	)
}
