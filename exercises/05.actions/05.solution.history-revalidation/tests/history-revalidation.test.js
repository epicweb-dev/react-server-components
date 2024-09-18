import { test, expect } from '@playwright/test'
import { searchShips } from '../db/ship-api.js'

test('Submitting the form posts to the action endpoint correctly', async ({
	page,
}) => {
	const {
		ships: [ship],
	} = await searchShips({ search: '' })
	await page.goto(`/`)
	await page.waitForLoadState('networkidle')

	await page.getByRole('link', { name: ship.name }).click()

	await page.getByRole('button', { name: ship.name }).click()

	const newName = `${ship.name} ${Math.random().toString(16).slice(2, 5)}`

	// Change the value of the input
	await page.getByRole('textbox', { name: 'Ship Name' }).fill(newName)

	// Press Enter
	await page.keyboard.press('Enter')

	// Verify the name of the ship in the list has been updated
	await expect(await page.getByRole('list').getByText(newName)).toBeVisible()

	await page.goBack()

	await expect(
		await page.getByRole('list').getByText(newName),
		'🚨 the history cache was not revalidated. Make sure to revalidate the cache during the popstate event.',
	).toBeVisible()
})
