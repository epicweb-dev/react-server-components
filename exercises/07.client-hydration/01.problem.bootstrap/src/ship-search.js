'use client'

import { Fragment, Suspense, createElement as h } from 'react'
import { ErrorBoundary } from './error-boundary.js'

export function ShipSearch({ search, results, fallback }) {
	return h(
		Fragment,
		null,
		h('input', {
			placeholder: 'Filter ships...',
			type: 'search',
			defaultValue: search,
			onChange: e => {
				console.log({ search: e.currentTarget.value })
			},
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
			h('ul', null, h(Suspense, { fallback }, results)),
		),
	)
}

export function SelectShipButton({ shipId, highlight, children }) {
	return h('button', {
		children,
		style: { fontWeight: highlight ? 'bold' : 'normal' },
		onClick: () => console.log({ shipId }),
	})
}
