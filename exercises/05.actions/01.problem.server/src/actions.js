import * as db from '../db/ship-api.js'

export async function updateShipName(previousState, formData) {
	try {
		await db.updateShipName({
			shipId: formData.get('shipId'),
			shipName: formData.get('shipName'),
		})
		// TODO: return success
	} catch (error) {
		// TODO: return error
	}
}
