import { createElement as h } from 'react'
import { searchShips } from '../db/ship-api.js'
import { shipDataStorage } from '../server/async-storage.js'
import { getImageUrlForShip, shipFallbackSrc } from './img-utils.js'

export async function SearchResults() {
	const { shipId: currentShipId, search } = shipDataStorage.getStore()
	const shipResults = await searchShips({ search })
	return shipResults.ships.map((ship) => {
		const href = [
			`/${ship.id}`,
			search ? `search=${encodeURIComponent(search)}` : null,
		]
			.filter(Boolean)
			.join('?')
		return h(
			'li',
			{ key: ship.name },
			h(
				'a',
				{
					href,
					style: { fontWeight: ship.id === currentShipId ? 'bold' : 'normal' },
				},
				h('img', {
					src: getImageUrlForShip(ship.id, { size: 20 }),
					alt: ship.name,
				}),
				ship.name,
			),
		)
	})
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
