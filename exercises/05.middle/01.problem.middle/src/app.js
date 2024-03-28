import { Fragment, createElement as h, Suspense } from 'react'
import { shipDataStorage } from '../server/async-storage.js'
import { shipFallbackSrc } from './img-utils.js'
import { ShipDetails, ShipFallback } from './ship-details.js'
import { SearchResults } from './ship-search-results.js'

export async function Document() {
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
		h('body', null, h('div', { className: 'app-wrapper' }, h(App))),
	)
}

export function App() {
	const { shipId, search } = shipDataStorage.getStore()
	return h(
		'div',
		{ className: 'app' },
		h(
			Suspense,
			{
				fallback: h('img', {
					style: { maxWidth: 400 },
					src: shipFallbackSrc,
				}),
			},
			h(
				'div',
				{ className: 'search' },
				h(
					Fragment,
					null,
					h(
						'form',
						null,
						h('input', {
							placeholder: 'Filter ships...',
							type: 'search',
							name: 'search',
							defaultValue: search,
							autoFocus: true,
						}),
					),
					h('ul', null, h(SearchResults)),
				),
			),
			h(
				'div',
				{ className: 'details' },
				shipId
					? h(Suspense, { fallback: h(ShipFallback) }, h(ShipDetails))
					: h('p', null, 'Select a ship from the list to see details'),
			),
		),
	)
}
