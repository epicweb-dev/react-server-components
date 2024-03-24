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

export function getImageUrlForShip(shipId, { size }) {
	return `/img/ships/${shipId}.webp?size=${size}`
}
