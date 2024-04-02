import { useState, useEffect, useRef } from 'react'

export const defaultOptions = {
	delay: 500,
	minDuration: 200,
}

export function useSpinDelay(loading, options) {
	options = Object.assign({}, defaultOptions, options)
	const [state, setState] = useState('IDLE')
	const timeout = useRef(null)
	useEffect(() => {
		if (loading && state === 'IDLE') {
			clearTimeout(timeout.current)
			timeout.current = setTimeout(() => {
				if (!loading) {
					return setState('IDLE')
				}
				timeout.current = setTimeout(() => {
					setState('EXPIRE')
				}, options.minDuration)
				setState('DISPLAY')
			}, options.delay)
			setState('DELAY')
		}
		if (!loading && state !== 'DISPLAY') {
			clearTimeout(timeout.current)
			setState('IDLE')
		}
	}, [loading, state, options.delay, options.minDuration])
	useEffect(() => {
		return () => clearTimeout(timeout.current)
	}, [])
	return state === 'DISPLAY' || state === 'EXPIRE'
}
