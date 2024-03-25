import { createElement as h } from 'react'
import { searchShips } from '../db/ship-api.js'
import { asyncLocalStorage } from '../server/rsc-async-storage.js'
import { getImageUrlForShip } from './img-utils.js'

const shipFallbackSrc = '/img/fallback-ship.png'

export async function SearchResults() {
	const { shipId: currentShipId, search } = asyncLocalStorage.getStore()
	const shipResults = await searchShips({ search })
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
