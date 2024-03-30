import { Fragment, createElement as h } from 'react'
// 🐨 import the shipDataStorage from ../server/async-storage.js here
import { ShipDetails } from './ship-details.js'
import { SearchResults } from './ship-search-results.js'

export function Document(
	// 💣 remove these props
	{ shipId, search, ship, shipResults },
) {
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
				h(
					App,
					// 💣 remove these props
					{ shipId, search, ship, shipResults },
				),
			),
		),
	)
}

export function App(
	// 💣 remove these props
	{ shipId, search, ship, shipResults },
) {
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
				h(
					'ul',
					null,
					h(
						SearchResults,
						// 💣 remove these props
						{ shipId, search, shipResults },
					),
				),
			),
		),
		h(
			'div',
			{ className: 'details' },
			shipId
				? h(
						ShipDetails,
						// 💣 remove these props
						{ shipId, ship },
					)
				: h('p', null, 'Select a ship from the list to see details'),
		),
	)
}
