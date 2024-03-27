import { createElement as h } from 'react'
import { shipDataStorage } from '../server/async-storage.js'
import { getImageUrlForShip } from './img-utils.js'

const shipFallbackSrc = '/img/fallback-ship.png'

export function SearchResults() {
	const { shipId: currentShipId, shipResults } = shipDataStorage.getStore()
	return shipResults.ships.map(ship =>
		h(
			'li',
			{ key: ship.name },
			h(
				'a',
				{
					style: { fontWeight: ship.id === currentShipId ? 'bold' : 'normal' },
					href: `/${ship.id}`,
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
				'a',
				{ href: '#' },
				h('img', { src: shipFallbackSrc, alt: 'loading' }),
				'... loading',
			),
		),
	)
}
