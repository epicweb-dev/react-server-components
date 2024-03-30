'use server'

import * as db from '../db/ship-api.js'

export async function updateShipName(previousState, formData) {
	const shouldSucceed = Math.random() > 0.5
	if (shouldSucceed) {
		await db.updateShipName({
			shipId: formData.get('shipId'),
			shipName: formData.get('shipName'),
		})
		return { status: 'success', message: 'Success!' }
	} else {
		return { status: 'error', message: 'Error! Unlucky' }
	}
}
