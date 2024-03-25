'use client'

import { createContext, use } from 'react'

export const RefreshRootContext = createContext({
	isPending: false,
	nextState: null,
	previousState: null,
	refresh: () => {
		throw new Error('refresh cannot be run on the server')
	},
})

export function useRefreshContext() {
	return use(RefreshRootContext)
}
