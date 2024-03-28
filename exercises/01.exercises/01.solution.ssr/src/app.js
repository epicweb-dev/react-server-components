import { Fragment, createElement as h } from 'react'
import { ShipDetails } from './ship-details.js'
import { SearchResults } from './ship-search-results.js'

export function Document({ shipId, search, ship, shipResults }) {
	return h(
		'html',
		{ lang: 'en' },
		h(
			'head',
			null,
			h('meta', { charSet: 'utf-8' }),
			h('meta', {
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			}),
			h('title', null, 'Super Simple RSC'),
			h('link', { rel: 'stylesheet', href: '/style.css' }),
			h('link', {
				rel: 'shortcut icon',
				type: 'image/svg+xml',
				href: '/favicon.svg',
			}),
		),
		h(
			'body',
			null,
			h(
				'div',
				{ className: 'app-wrapper' },
				h(App, { shipId, search, ship, shipResults }),
			),
		),
	)
}

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
				h('input', {
					placeholder: 'Filter ships...',
					type: 'search',
					defaultValue: search,
					autoFocus: true,
				}),
				h('ul', null, h(SearchResults, { shipId, search, shipResults })),
			),
		),
		h(
			'div',
			{ className: 'details' },
			shipId
				? h(ShipDetails, { shipId, ship })
				: h('p', null, 'Select a ship from the list to see details'),
		),
	)
}
