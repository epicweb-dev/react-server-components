'use client'

import { Fragment, Suspense, createElement as h } from 'react'
import { ErrorBoundary } from './error-boundary.js'
import { useRefreshContext } from './refresh.js'
import { useSpinDelay } from './spin-delay.js'

export function ShipSearch({ search, results, fallback }) {
	const { refresh, isPending, nextState, previousState } = useRefreshContext()
	const isShipSearchPending = useSpinDelay(
		isPending && nextState.search !== previousState.search,
	)
	return h(
		Fragment,
		null,
		h('input', {
			placeholder: 'Filter ships...',
			type: 'search',
			defaultValue: search,
			onChange: e => refresh({ search: e.currentTarget.value }),
		}),
		h(
			ErrorBoundary,
			{
				fallback: h(
					'div',
					{ style: { padding: 6, color: '#CD0DD5' } },
					'There was an error retrieving results',
				),
			},
			h(
				'ul',
				{ style: { opacity: isShipSearchPending ? 0.6 : 1 } },
				h(Suspense, { fallback }, results),
			),
		),
	)
}

export function SelectShipButton({ shipId, highlight, children }) {
	const { refresh } = useRefreshContext()
	return h('button', {
		children,
		style: { fontWeight: highlight ? 'bold' : 'normal' },
		onClick: () => refresh({ shipId }),
	})
}
