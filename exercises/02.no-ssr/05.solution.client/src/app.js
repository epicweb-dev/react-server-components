import { Fragment, Suspense, createElement as h } from 'react'
import { shipDataStorage } from '../server/async-storage.js'
import { ErrorBoundary } from './error-boundary.js'
import { ShipDetails, ShipError, ShipFallback } from './ship-details.js'
import {
	SearchResults,
	SearchResultsFallback,
	ShipResultsErrorFallback,
} from './ship-search-results.js'

export async function App() {
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
					ErrorBoundary,
					{ fallback: h(ShipResultsErrorFallback) },
					h(
						'ul',
						null,
						h(
							Suspense,
							{ fallback: h(SearchResultsFallback) },
							h(SearchResults),
						),
					),
				),
			),
		),
		h(
			'div',
			{ className: 'details' },
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
