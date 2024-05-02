import { Fragment, createElement as h } from 'react'
import { ShipDetails } from './ship-details.js'
import { SearchResults } from './ship-search-results.js'

export function App({ shipId, search, ship, shipResults }) {
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
				h('ul', null, h(SearchResults, { shipId, search, shipResults })),
			),
		),
		h(
			'div',
			{ className: 'details' },
			shipId
				? h(ShipDetails, { ship })
				: h('p', null, 'Select a ship from the list to see details'),
		),
	)
}
