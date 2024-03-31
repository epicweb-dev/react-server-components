import { createElement as h } from 'react'
import { getCount } from '../db/count.js'
import { ActionButton } from './action-button.js'
import * as actions from './actions.js'

console.log(actions.decrement.toString())

export function App() {
	const count = getCount()
	return h(
		'div',
		{ className: 'app' },
		h('h1', null, 'Counter:'),
		h(
			'div',
			{ className: 'counter' },
			h('output', null, count),
			h(
				'div',
				null,
				h(ActionButton, { action: actions.decrement }, '⬅️'),
				h(ActionButton, { action: actions.increment }, '➡️'),
			),
		),
	)
}
