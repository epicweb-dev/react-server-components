import { test, expect } from '@playwright/test'
import { searchShips } from '../db/ship-api.js'

test('Submitting the form posts to the action endpoint correctly', async ({
	page,
}) => {
	const {
		ships: [ship],
	} = await searchShips({ search: '' })
	await page.goto(`/${ship.id}`)
	await page.waitForLoadState('networkidle')

	await page.getByRole('button', { name: ship.name }).click()

	const newName = `${ship.name} ${Math.random().toString(16).slice(2, 5)}`

	// Change the value of the input
	await page.getByRole('textbox', { name: 'Ship Name' }).fill(newName)

	// Intercept the request to /action
	const actionRequest = page.waitForRequest(request => {
		return request.url().includes('/action') && request.method() === 'POST'
	})

	// Press Enter
	await page.keyboard.press('Enter')

	// Wait for the request to be made
	const request = await actionRequest

	// Verify the request URL
	expect(request.url()).toContain(`/action/${ship.id}`)

	const response = await request.response()
	expect(response.status(), '🚨 have you made the action endpoint yet?').toBe(
		200,
	)

	// Verify the form data payload
	const postData = await request.postData()
	expect(postData).toContain(newName)
	expect(postData).toContain(ship.id)

	// Verify the rsc-action header
	const headers = request.headers()
	expect(headers['rsc-action']).toContain('ui/actions.js#updateShipName')

	// Verify the response body
	const responseBody = await response.text()
	// it should have a returnValue and a root
	expect(responseBody).toContain('returnValue')
	expect(responseBody).toContain('root')
	// It should have the success message in the return value
	expect(responseBody).toContain('Success!')
	// And it should have updated the ship name
	expect(responseBody).toContain(newName)

	// Verify the name of the ship in the list has been updated
	await expect(
		await page.getByRole('list').getByText(newName),
		'🚨 the list of ships has not been updated. Make sure to update the RSC content with the root returned from the action call',
	).toBeVisible()
})
