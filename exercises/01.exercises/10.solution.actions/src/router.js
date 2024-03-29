import { createContext, use } from 'react'

export const RouterContext = createContext()

export function useRouter() {
	const context = use(RouterContext)
	if (!context) {
		throw new Error('useRouter must be used within a Router')
	}
	return context
}

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
