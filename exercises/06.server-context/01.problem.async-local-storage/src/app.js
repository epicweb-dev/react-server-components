import { Fragment, createElement as h, Suspense } from 'react'
import { shipDataStorage } from '../server/async-storage.js'
import { ShipDetails, ShipFallback } from './ship-details.js'
import { SearchResults, SearchResultsFallback } from './ship-search-results.js'

const shipFallbackSrc = '/img/fallback-ship.png'

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
					h('input', {
						placeholder: 'Filter ships...',
						type: 'search',
						defaultValue: search,
					}),
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
				h(
					Suspense,
					{ fallback: h(ShipFallback, { shipId }) },
					h(ShipDetails, { shipId }),
				),
			),
		),
	)
}
