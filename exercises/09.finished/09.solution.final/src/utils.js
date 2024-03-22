const API_ORIGIN = new URL(process.env.API_ORIGIN)
const shipCache = new Map()

export function getShip(name, delay) {
	const shipPromise = shipCache.get(name) ?? getShipImpl(name, delay)
	shipCache.set(name, shipPromise)
	return shipPromise
}

async function getShipImpl(name, delay) {
	const searchParams = new URLSearchParams({ name })
	if (delay) searchParams.set('delay', String(delay))
	const response = await fetch(
		new URL(`/api/get-ship?${searchParams.toString()}`, API_ORIGIN),
	)
	if (!response.ok) {
		return Promise.reject(new Error(await response.text()))
	}
	const ship = await response.json()
	return ship
}

const shipSearchCache = new Map()

export function searchShips(query, delay) {
	const searchPromise =
		shipSearchCache.get(query) ?? searchShipImpl(query, delay)
	shipSearchCache.set(query, searchPromise)
	return searchPromise
}

async function searchShipImpl(query, delay) {
	const searchParams = new URLSearchParams({ query })
	if (delay) searchParams.set('delay', String(delay))
	const response = await fetch(
		new URL(`/api/search-ships?${searchParams.toString()}`, API_ORIGIN),
	)
	if (!response.ok) {
		return Promise.reject(new Error(await response.text()))
	}
	const ship = await response.json()
	return ship
}
