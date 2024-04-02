'use server'

import * as db from '../db/ship-api.js'

export async function updateShipName(previousState, formData) {
	try {
		await db.updateShipName({
			shipId: formData.get('shipId'),
			shipName: formData.get('shipName'),
		})
		return { status: 'success', message: 'Success!' }
	} catch (error) {
		return { status: 'error', message: error?.message || String(error) }
	}
}
