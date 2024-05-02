import { createElement as h, Suspense } from 'react'
import { shipDataStorage } from '../server/async-storage.js'
import { ErrorBoundary } from './error-boundary.js'
// 🐨 you're going to want this
// import { ShipDetailsPendingTransition } from './ship-details-pending.js'
import { ShipDetails, ShipFallback, ShipError } from './ship-details.js'
import { SearchResults, SearchResultsFallback } from './ship-search-results.js'
import { ShipSearch } from './ship-search.js'

export function App() {
	const { shipId, search } = shipDataStorage.getStore()
	return h(
		'div',
		{ className: 'app' },
		h(
			'div',
			{ className: 'search' },
			h(ShipSearch, {
				search,
				results: h(SearchResults, { search }),
				fallback: h(SearchResultsFallback),
			}),
		),
		h(
			// 🐨 we can't use useRouter in here because this is a server component
			// and can't use state. So we moved this div with the details className
			// into ./ship-details-pending.js which is a client component. Replace
			// this div with the ShipDetailsPendingTransition component
			'div',
			// 💰 ShipDetailsPendingTransition doesn't need any props, so you can pass null here.
			{ className: 'details' },
			// 🦉 the rest of this can be unchanged. Cool how we can pass server
			// components to the client components, right?!
			h(
				ErrorBoundary,
				{ fallback: h(ShipError) },
				shipId
					? h(Suspense, { fallback: h(ShipFallback) }, h(ShipDetails))
					: h('p', null, 'Select a ship from the list to see details'),
			),
		),
	)
}
