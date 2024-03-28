export function getImageUrlForShip(shipId, { size }) {
	return `/img/ships/${shipId}.webp?size=${size}`
}
