'use client'

import { use, Suspense, createElement as h } from 'react'
import { ErrorBoundary } from './error-boundary.js'
import { imgSrc } from './img-utils.js'

const shipFallbackSrc = '/img/fallback-ship.png'

export function ShipImg(props) {
	return h(
		ErrorBoundary,
		{ fallback: h('img', props), key: props.src },
		h(
			Suspense,
			{ fallback: h('img', { ...props, src: shipFallbackSrc }) },
			h(Img, props),
		),
	)
}

function Img({ src = '', ...props }) {
	src = use(imgSrc(src))
	return h('img', { src, ...props })
}
