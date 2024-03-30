import { createElement as h } from 'react'
// 🐨 get your shipDataStorage from ../server/async-storage.js
import { getImageUrlForShip } from './img-utils.js'

export function SearchResults(
	// 💣 remove these props
	{ shipId: currentShipId, shipResults, search },
) {
	// 🐨 get the shipId, shipResults, and search from shipDataStorage.getStore()
	return shipResults.ships.map(ship => {
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
