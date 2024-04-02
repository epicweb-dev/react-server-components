import fs from 'node:fs/promises'

const shipData = JSON.parse(
	String(await fs.readFile(new URL('./ships.json', import.meta.url))),
)

const MIN_DELAY = 200
const MAX_DELAY = 500

export async function searchShips({
	search,
	delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY,
}) {
	const endTime = Date.now() + delay
	const ships = shipData
		.filter(ship => ship.name.toLowerCase().includes(search.toLowerCase()))
		.slice(0, 13)
	await new Promise(resolve => setTimeout(resolve, endTime - Date.now()))
	return {
		ships: ships.map(ship => ({ name: ship.name, id: ship.id })),
	}
}

export async function getShip({
	shipId,
	delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY,
}) {
	const endTime = Date.now() + delay
	if (!shipId) {
		throw new Error('No shipId provided')
	}
	const ship = shipData.find(ship => ship.id === shipId)
	await new Promise(resolve => setTimeout(resolve, endTime - Date.now()))
	if (!ship) {
		throw new Error(`No ship with the id "${shipId}"`)
	}
	return ship
}

export async function updateShipName({
	shipId,
	shipName,
	delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY,
}) {
	const endTime = Date.now() + delay
	const ship = shipData.find(ship => ship.id === shipId)
	await new Promise(resolve => setTimeout(resolve, endTime - Date.now()))
	if (!ship) {
		throw new Error(`No ship with the id "${shipId}"`)
	}
	if (shipName.toLowerCase().includes('error')) {
		throw new Error('Error updating ship name')
	}
	if (shipName === ship.name) {
		throw new Error('New name is the same as the old name')
	}
	ship.name = shipName
	return ship
}
