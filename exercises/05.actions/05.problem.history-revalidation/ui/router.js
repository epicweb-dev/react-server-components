import { createContext, use } from 'react'
import { useEffect } from 'react'

export const RouterContext = createContext()

export function useRouter() {
	const context = use(RouterContext)
	if (!context) {
		throw new Error('useRouter must be used within a Router')
	}
	return context
}

// Thanks Devon: https://twitter.com/devongovett/status/1672307153699471360
export function useLinkHandler(navigate) {
	useEffect(() => {
		function onClick(event) {
			const link = event.target.closest('a')
			if (
				link &&
				link instanceof HTMLAnchorElement &&
				link.href &&
				(!link.target || link.target === '_self') &&
				link.origin === location.origin &&
				!link.hasAttribute('download') &&
				event.button === 0 && // left clicks only
				!event.metaKey && // open in new tab (mac)
				!event.ctrlKey && // open in new tab (windows)
				!event.altKey && // download
				!event.shiftKey &&
				!event.defaultPrevented
			) {
				event.preventDefault()
				navigate(link.pathname + link.search)
			}
		}

		document.addEventListener('click', onClick)
		return () => {
			document.removeEventListener('click', onClick)
		}
	}, [navigate])
}

export const getGlobalLocation = () =>
	window.location.pathname + window.location.search

export function parseLocationState(location) {
	const url = new URL(location, 'http://example.com')
	return {
		shipId: url.pathname.split('/').at(1),
		search: url.searchParams.get('search'),
	}
}

export function serializeLocationState({ shipId, search }) {
	const pathname = shipId ? `/${shipId}` : '/'
	const searchParams = new URLSearchParams()
	if (search) {
		searchParams.set('search', search)
	}
	return [pathname, searchParams.toString()].filter(Boolean).join('?')
}

export function mergeLocationState(location, updates) {
	const currentState = parseLocationState(location)
	const nextState = { ...currentState, ...updates }
	return serializeLocationState(nextState)
}
