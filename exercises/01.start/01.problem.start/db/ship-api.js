import shipData from './ships.json' assert { type: 'json' }

const formatDate = date =>
	`${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${String(
		date.getSeconds(),
	).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`

export async function searchShips({
	query,
	delay = Math.random() * 200 + 300,
}) {
	const endTime = Date.now() + delay
	const ships = shipData
		.filter(ship => ship.name.toLowerCase().includes(query.toLowerCase()))
		.slice(0, 13)
	await new Promise(resolve => setTimeout(resolve, endTime - Date.now()))
	return {
		ships: ships.map(ship => ({ name: ship.name, id: ship.id })),
		fetchedAt: formatDate(new Date()),
	}
}

export async function getShip({ shipId, delay = Math.random() * 200 + 300 }) {
	const endTime = Date.now() + delay
	if (!shipId) {
		throw new Error('No shipId provided')
	}
	const ship = shipData.find(ship => ship.id === shipId)
	await new Promise(resolve => setTimeout(resolve, endTime - Date.now()))
	if (!ship) {
		throw new Error(`No ship with the id "${shipId}"`)
	}
	return {
		...ship,
		fetchedAt: 'TODO', // formatDate(new Date())
	}
}

export async function updateShipName({
	shipId,
	shipName,
	delay = Math.random() * 200 + 300,
}) {
	const endTime = Date.now() + delay
	const ship = shipData.find(ship => ship.id === shipId)
	await new Promise(resolve => setTimeout(resolve, endTime - Date.now()))
	if (!ship) {
		throw new Error(`No ship with the id "${shipId}"`)
	}
	ship.name = shipName
	return {
		...ship,
		fetchedAt: formatDate(new Date()),
	}
}
