import { createElement as h } from 'react'
import { searchShips } from '../db/ship-api.js'
import { shipDataStorage } from '../server/async-storage.js'
import { getImageUrlForShip, shipFallbackSrc } from './img-utils.js'
import { ShipImg } from './img.js'
import { SelectShipLink } from './ship-search.js'

export async function SearchResults() {
	const { shipId: currentShipId, search } = shipDataStorage.getStore()
	const shipResults = await searchShips({ search })
	return shipResults.ships.map(ship =>
		h(
			'li',
			{ key: ship.name },
			h(
				SelectShipLink,
				{ shipId: ship.id, highlight: ship.id === currentShipId },
				h(ShipImg, {
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
