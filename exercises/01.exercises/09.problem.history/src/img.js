'use client'

import { use, Suspense, createElement as h } from 'react'
import { ErrorBoundary } from './error-boundary.js'
import { shipFallbackSrc } from './img-utils.js'

const imgCache = new Map()

export function imgSrc(src) {
	const imgPromise = imgCache.get(src) ?? preloadImage(src)
	imgCache.set(src, imgPromise)
	return imgPromise
}

function preloadImage(src) {
	if (typeof document === 'undefined') return Promise.resolve(src)

	return new Promise(async (resolve, reject) => {
		const img = new Image()
		img.src = src
		img.onload = () => resolve(src)
		img.onerror = reject
	})
}

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
