import { createElement as h } from 'react'
// 💰 you're gonna need this:
// import { getShip } from '../db/ship-api.js'
import { getImageUrlForShip } from './img-utils.js'

// 🐨 replace the ship prop with a shipId prop
export function ShipDetails({ ship }) {
	// 🐨 get the ship using getShip({ shipId })
	// 💰 you can use async/await!
	const shipImgSrc = getImageUrlForShip(ship.id, { size: 200 })
	return h(
		'div',
		{ className: 'ship-info' },
		h(
			'div',
			{ className: 'ship-info__img-wrapper' },
			h('img', { src: shipImgSrc, alt: ship.name }),
		),
		h('section', null, h('h2', null, ship.name)),
		h('div', null, 'Top Speed: ', ship.topSpeed, ' ', h('small', null, 'lyh')),
		h(
			'section',
			null,
			ship.weapons.length
				? h(
						'ul',
						null,
						ship.weapons.map(weapon =>
							h(
								'li',
								{ key: weapon.name },
								h('label', null, weapon.name),
								':',
								' ',
								h(
									'span',
									null,
									weapon.damage,
									' ',
									h('small', null, '(', weapon.type, ')'),
								),
							),
						),
					)
				: h('p', null, 'NOTE: This ship is not equipped with any weapons.'),
		),
	)
}
