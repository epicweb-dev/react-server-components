'use client'

import { createElement as h } from 'react'
import { parseLocationState, useRouter } from './router.js'
import { useSpinDelay } from './spin-delay.js'

export function ShipDetailsPendingTransition({ children }) {
	const { location, nextLocation } = useRouter()
	const isShipDetailsPending = useSpinDelay(
		parseLocationState(nextLocation).shipId !==
			parseLocationState(location).shipId,
		{ delay: 300, minDuration: 350 },
	)

	return h('div', {
		className: 'details',
		style: { opacity: isShipDetailsPending ? 0.6 : 1 },
		children,
	})
}
