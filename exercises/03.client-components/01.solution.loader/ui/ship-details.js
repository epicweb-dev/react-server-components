import { createElement as h } from 'react'
import { getShip } from '../db/ship-api.js'
import { shipDataStorage } from '../server/async-storage.js'
import { EditableText } from './edit-text.js'
import { getImageUrlForShip } from './img-utils.js'

const properties = {}
for (const [key, descriptor] of Object.entries(
	Object.getOwnPropertyDescriptors(EditableText),
)) {
	properties[key] = descriptor.value
}

console.log(EditableText.toString())
console.log(
	JSON.stringify(
		properties,
		(key, value) => (typeof value === 'object' ? value : String(value)),
		2,
	),
)

export async function ShipDetails() {
	const { shipId } = shipDataStorage.getStore()
	const ship = await getShip({ shipId })
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
						ship.weapons.map((weapon) =>
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

export function ShipFallback() {
	const { shipId } = shipDataStorage.getStore()
	return h(
		'div',
		{ className: 'ship-info' },
		h(
			'div',
			{ className: 'ship-info__img-wrapper' },
			h('img', {
				src: getImageUrlForShip(shipId, { size: 200 }),
				// TODO: handle this better
				alt: shipId,
			}),
		),
		h('section', null, h('h2', null, 'Loading...')),
		h('div', null, 'Top Speed: XX', ' ', h('small', null, 'lyh')),
		h(
			'section',
			null,
			h(
				'ul',
				null,
				Array.from({ length: 3 }).map((_, i) =>
					h(
						'li',
						{ key: i },
						h('label', null, 'loading'),
						':',
						' ',
						h('span', null, 'XX ', h('small', null, '(loading)')),
					),
				),
			),
		),
	)
}
