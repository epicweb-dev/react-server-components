import { createElement as h } from 'react'
import { searchShips } from '../db/ship-api.js'
import { getImageUrlForShip } from './img-utils.js'

export async function SearchResults({ shipId: currentShipId, search }) {
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
