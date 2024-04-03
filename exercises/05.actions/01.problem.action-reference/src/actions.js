// 🐨 add 'use server' here to turn this module into an RSC reference

import * as db from '../db/ship-api.js'

export async function updateShipName(previousState, formData) {
	try {
		await db.updateShipName({
			shipId: formData.get('shipId'),
			shipName: formData.get('shipName'),
		})
		// 🐨 return a status of 'success' and a message of 'Success!'
	} catch (error) {
		// 🐨 return a status of 'error' and a message of error?.message || String(error)
	}
}
