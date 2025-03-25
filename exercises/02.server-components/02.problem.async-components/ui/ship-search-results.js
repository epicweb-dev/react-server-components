import { createElement as h } from 'react'
// 💰 you're gonna need this
// import { searchShips } from '../db/ship-api.js'
import { getImageUrlForShip } from './img-utils.js'

// 💣 remove the shipResults prop
export function SearchResults({ shipId: currentShipId, shipResults, search }) {
	// 🐨 get the shipResults from searchShips({ search })
	// 💰 you can use async/await!
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
