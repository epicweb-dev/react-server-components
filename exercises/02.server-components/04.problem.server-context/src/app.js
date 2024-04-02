import { Fragment, Suspense, createElement as h } from 'react'
import { ShipDetails, ShipFallback } from './ship-details.js'
import { SearchResults, SearchResultsFallback } from './ship-search-results.js'

export function App({ shipId, search }) {
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
					h(
						Suspense,
						{ fallback: h(SearchResultsFallback) },
						h(SearchResults, { shipId, search }),
					),
				),
			),
		),
		h(
			'div',
			{ className: 'details' },
			shipId
				? h(
						Suspense,
						{ fallback: h(ShipFallback, { shipId }) },
						h(ShipDetails, { shipId }),
					)
				: h('p', null, 'Select a ship from the list to see details'),
		),
	)
}
