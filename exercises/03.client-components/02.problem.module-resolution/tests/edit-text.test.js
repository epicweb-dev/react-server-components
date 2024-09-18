import { test, expect } from '@playwright/test'
import { searchShips } from '../db/ship-api.js'

test('should display the home page and perform search', async ({ page }) => {
	const {
		ships: [ship],
	} = await searchShips({ search: 'hopper' })
	const newName = `${ship.name} ${Math.random().toString(16).slice(2, 5)}`
	await page.goto(`/${ship.id}`)

	// Wait for the loading state to disappear
	await page.waitForSelector('h2:has-text("Loading...")', { state: 'detached' })

	// Ensure the ship name is visible
	await expect(page.getByRole('heading', { name: ship.name })).toBeVisible()
	// Find and click the edit button
	await page.getByRole('button', { name: ship.name }).click()

	// Check if the input is focused
	await expect(page.getByRole('textbox', { name: 'Ship Name' })).toBeFocused()

	// Change the value of the input
	await page.getByRole('textbox', { name: 'Ship Name' }).fill(newName)

	// Press Enter
	await page.keyboard.press('Enter')

	// Check if the button is back
	await expect(page.getByRole('button', { name: newName })).toBeVisible()
})
