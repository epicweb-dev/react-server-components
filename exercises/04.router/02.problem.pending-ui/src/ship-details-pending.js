'use client'

import { createElement as h } from 'react'
// 💰 you'll want this
// import { parseLocationState, useRouter } from './router.js'
// 💯 if you want to do the extra credit, grab this
// import { useSpinDelay } from './spin-delay.js'

export function ShipDetailsPendingTransition({ children }) {
	// 🐨 get the location and nextLocation from useRouter
	// 🐨 the details are pending if the shipId of the nextLocation differs from
	// the shipId of the current location
	// 💰 use parseLocationState to get the shipId.
	// 💯 for extra credit, avoid a flash of loading state with useSpinDelay
	const isShipDetailsPending = false

	return h('div', {
		className: 'details',
		style: { opacity: isShipDetailsPending ? 0.6 : 1 },
		children,
	})
}
