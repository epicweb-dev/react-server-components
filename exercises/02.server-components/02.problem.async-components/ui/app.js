import { Fragment, createElement as h } from 'react'
import { ShipDetails } from './ship-details.js'
import { SearchResults } from './ship-search-results.js'

// 💣 remove the ship and shipResults props
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
				// 💣 remove the shipResults prop
				h('ul', null, h(SearchResults, { shipId, search, shipResults })),
			),
		),
		h(
			'div',
			{ className: 'details' },
			shipId
				? // 🐨 replace the ship prop with a shipId prop
					h(ShipDetails, { ship })
				: h('p', null, 'Select a ship from the list to see details'),
		),
	)
}
