import { Fragment, Suspense, createElement as h } from 'react'
// 💰 you'll want this:
// import { shipDataStorage } from '../server/async-storage.js'
import { ShipDetails, ShipFallback } from './ship-details.js'
import { SearchResults, SearchResultsFallback } from './ship-search-results.js'

export function App(
	// 💣 remove these props
	{ shipId, search },
) {
	// 🐨 use shipDataStorage.getStore() to access the shipId and search
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
						h(
							SearchResults,
							// 💣 remove the props here
							{ shipId, search },
						),
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
						{
							fallback: h(
								ShipFallback,
								// 💣 remove the shipId prop here
								{ shipId },
							),
						},
						h(
							ShipDetails,
							// 💣 remove the shipId prop here
							{ shipId },
						),
					)
				: h('p', null, 'Select a ship from the list to see details'),
		),
	)
}
