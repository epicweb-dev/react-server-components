import { createElement as h } from 'react'
import { searchShips } from '../db/ship-api.js'
import { asyncLocalStorage } from '../server/rsc-async-storage.js'
import { getImageUrlForShip } from './img-utils.js'
import { ShipImg } from './img.js'
import { SelectShipButton } from './ship-search.js'

const shipFallbackSrc = '/img/fallback-ship.png'

export async function SearchResults() {
	const { shipId: currentShipId, search } = asyncLocalStorage.getStore()
	const shipResults = await searchShips({ query: search })
	return shipResults.ships.map(ship =>
		h(
			'li',
			{ key: ship.name },
			h(
				SelectShipButton,
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
				'button',
				null,
				h('img', { src: shipFallbackSrc, alt: 'loading' }),
				'... loading',
			),
		),
	)
}
