import { createElement as h, Suspense } from 'react'
import { shipDataStorage } from '../server/async-storage.js'
import { ErrorBoundary } from './error-boundary.js'
import { ShipDetailsPendingTransition } from './ship-details-pending.js'
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
			ShipDetailsPendingTransition,
			null,
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
