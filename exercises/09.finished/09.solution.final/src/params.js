import {
	createElement as h,
	createContext,
	useCallback,
	use,
	useEffect,
	useState,
} from 'react'

export function setGlobalSearchParams(params, options) {
	const searchParams = new URLSearchParams(window.location.search)
	for (const [key, value] of Object.entries(params)) {
		if (!value) searchParams.delete(key)
		else searchParams.set(key, value)
	}
	const newUrl = [window.location.pathname, searchParams.toString()]
		.filter(Boolean)
		.join('?')
	if (options.replace) {
		window.history.replaceState({}, '', newUrl)
	} else {
		window.history.pushState({}, '', newUrl)
	}
	return searchParams
}

const QueryParamsContext = createContext(null)

export function QueryParamsProvider({ children }) {
	const [searchParams, setSearchParamsState] = useState(
		() => new URLSearchParams(window.location.search),
	)

	useEffect(() => {
		function updateSearchParams() {
			setSearchParamsState(prevParams => {
				const newParams = new URLSearchParams(window.location.search)
				return prevParams.toString() === newParams.toString()
					? prevParams
					: newParams
			})
		}
		window.addEventListener('popstate', updateSearchParams)
		return () => window.removeEventListener('popstate', updateSearchParams)
	}, [])

	const setSearchParams = useCallback((...args) => {
		const searchParams = setGlobalSearchParams(...args)
		setSearchParamsState(prevParams => {
			return prevParams.toString() === searchParams.toString()
				? prevParams
				: searchParams
		})
		return searchParams
	}, [])

	const searchParamsTuple = [searchParams, setSearchParams]

	return h(QueryParamsContext.Provider, { value: searchParamsTuple }, children)
}

export function useSearchParams() {
	const context = use(QueryParamsContext)
	if (!context) {
		throw new Error('useSearchParams must be used within a QueryParamsProvider')
	}
	return context
}
