import { test, expect } from '@playwright/test'
import { searchShips } from '../db/ship-api.js'

test('RSC endpoint response includes reference to actions.js', async ({
	page,
}) => {
	const {
		ships: [firstShip],
	} = await searchShips({ search: '' })
	await page.goto(`/${firstShip.id}`)

	// Make a GET request to the /rsc endpoint
	const response = await page.request.get(`/rsc/${firstShip.id}`)

	// Get the response text
	const responseText = await response.text()

	// Verify that the response includes "actions.js"
	expect(responseText).toContain('actions.js')
})
