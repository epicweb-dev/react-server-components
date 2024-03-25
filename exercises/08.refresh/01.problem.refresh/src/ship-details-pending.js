'use client'

import { createElement as h } from 'react'
import { useRefreshContext } from './refresh.js'
import { useSpinDelay } from './spin-delay.js'

export function ShipDetailsPendingTransition({ children }) {
	const { isPending, nextState, previousState } = useRefreshContext()
	const isShipDetailsPending = useSpinDelay(
		isPending && nextState.shipId !== previousState.shipId,
	)
	return h('div', {
		className: 'details',
		style: { opacity: isShipDetailsPending ? 0.6 : 1 },
		children,
	})
}
