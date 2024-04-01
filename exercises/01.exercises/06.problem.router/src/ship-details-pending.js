'use client'

import { createElement as h } from 'react'

export function ShipDetailsPendingTransition({ children }) {
	// 🐨 get the location and nextLocation from useRouter
	// 🐨 use parseLocationState on the location and nextLocation
	// 🐨 if the shipId is different in the state of each location, then we're pending
	// 💯 wrap this pending state in useSpinDelay ('./spin-delay.js') to avoid a flash of pending state
	const isShipDetailsPending = false

	return h('div', {
		className: 'details',
		style: { opacity: isShipDetailsPending ? 0.6 : 1 },
		children,
	})
}
