import { Fragment, Suspense, createElement as h } from 'react'
import { shipDataStorage } from '../server/async-storage.js'
// 🐨 import the ErrorBoundary from the client module
// import { ErrorBoundary } from './error-boundary.js'
import { ShipDetails, ShipFallback } from './ship-details.js'
import { SearchResults, SearchResultsFallback } from './ship-search-results.js'

// 🐨 log the ErrorBoundary to the console so you can see what the server sees
// 💰 console.log(ErrorBoundary.toString())

export function App() {
	const { shipId, search } = shipDataStorage.getStore()
	return h(
		'div',
		{ className: 'app' },
		h(
			'div',
			{ className: 'search' },
			h(
				Fragment,
				null,
				h(
					'form',
					{},
					h('input', {
						name: 'search',
						placeholder: 'Filter ships...',
						type: 'search',
						defaultValue: search,
						autoFocus: true,
					}),
				),
				h(
					'ul',
					null,
					h(Suspense, { fallback: h(SearchResultsFallback) }, h(SearchResults)),
				),
			),
		),
		h(
			'div',
			{ className: 'details' },
			shipId
				? h(Suspense, { fallback: h(ShipFallback) }, h(ShipDetails))
				: h('p', null, 'Select a ship from the list to see details'),
		),
	)
}
