import { createElement as h } from 'react'
import { getImageUrlForShip } from './img-utils.js'

const shipFallbackSrc = '/img/fallback-ship.png'

export function SearchResults({ shipId: currentShipId, shipResults }) {
	return shipResults.ships.map(ship =>
		h(
			'li',
			{ key: ship.name },
			h(
				'button',
				{
					style: { fontWeight: ship.id === currentShipId ? 'bold' : 'normal' },
				},
				h('img', {
					src: getImageUrlForShip(ship.id, { size: 20 }),
					alt: ship.name,
				}),
				ship.name,
			),
		),
	)
}

export function SearchResultsFallback() {
	return Array.from({
		length: 12,
	}).map((_, i) =>
		h(
			'li',
			{ key: i },
			h(
				'button',
				null,
				h('img', { src: shipFallbackSrc, alt: 'loading' }),
				'... loading',
			),
		),
	)
}
