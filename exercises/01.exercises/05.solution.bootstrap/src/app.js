import { createElement as h, Suspense } from 'react'
import { shipDataStorage } from '../server/async-storage.js'
import { ErrorBoundary } from './error-boundary.js'
import { shipFallbackSrc } from './img-utils.js'
import { ShipDetailsPendingTransition } from './ship-details-pending.js'
import { ShipDetails, ShipFallback, ShipError } from './ship-details.js'
import { SearchResults, SearchResultsFallback } from './ship-search-results.js'
import { ShipSearch } from './ship-search.js'

export function Document() {
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

function App() {
	const { shipId, search } = shipDataStorage.getStore()
	return h(
		'div',
		{ className: 'app' },
		h(
			ErrorBoundary,
			{
				fallback: h(
					'div',
					{ className: 'app-error' },
					h('p', null, 'Something went wrong!'),
				),
			},
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
					h(ShipSearch, {
						search,
						results: h(SearchResults, { search }),
						fallback: h(SearchResultsFallback),
					}),
				),
				h(
					ShipDetailsPendingTransition,
					null,
					h(
						ErrorBoundary,
						{ fallback: h(ShipError) },
						shipId
							? h(Suspense, { fallback: h(ShipFallback) }, h(ShipDetails))
							: h('p', null, 'Select a ship from the list to see details'),
					),
				),
			),
		),
	)
}
