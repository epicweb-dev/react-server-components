// 🐨 you'll want to import Suspense from react
import { /* Suspense, */ Fragment, createElement as h } from 'react'
import {
	ShipDetails,
	// 💰 you'll want this:
	// ShipFallback
} from './ship-details.js'
import {
	SearchResults,
	// 💰 you'll want this:
	// SearchResultsFallback
} from './ship-search-results.js'

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
					// 🐨 wrap this in a Suspense boundary with the fallback set to
					// h(SearchResultsFallback)
					// 💰 remember it's h(Component, props, child1, child2, child3)
					// 💰 don't feel too bad if you need to reference the diff on this one
					// it's kinda hard to go back to non-JSX after you've been used to
					// using JSX for a while 😅
					h(SearchResults, { shipId, search }),
				),
			),
		),
		h(
			'div',
			{ className: 'details' },
			shipId
				? // 🐨 wrap this in a Suspense boundary with the fallback set to h(ShipFallback, { shipId })
					h(ShipDetails, { shipId })
				: h('p', null, 'Select a ship from the list to see details'),
		),
	)
}
