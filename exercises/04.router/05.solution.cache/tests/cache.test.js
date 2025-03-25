import { test, expect } from '@playwright/test'
import { shipFallbackSrc } from '../ui/img-utils.js'

test('going forward and backward in history updates the UI', async ({
	page,
}) => {
	await page.goto('/')
	await page.waitForLoadState('networkidle')

	// simulate a slow network for the /rsc endpoint so we force the pending UI to show up
	await page.route('/rsc/*', async (route) => {
		await new Promise((resolve) =>
			setTimeout(resolve, process.env.CI ? 1000 : 400),
		)
		await route.continue()
	})

	const shipList = page.getByRole('list').first()

	// Click the first item and store its text content
	const firstShipLink = shipList.getByRole('link').first()
	const firstShipName = await firstShipLink.textContent()
	await firstShipLink.click()

	// Wait for the h2 heading to update and verify its content
	const shipTitle = page.getByRole('heading', { level: 2 })
	await expect(shipTitle).toHaveText(firstShipName)

	// Click the second item and store its text content
	const secondShipLink = shipList.getByRole('link').nth(1)
	const secondShipName = await secondShipLink.textContent()
	await secondShipLink.click()

	// Wait for the h2 heading to update and verify its content
	await expect(shipTitle).toHaveText(secondShipName)

	// Go back in browser history
	await page.goBack()
	// Verify the root suspense boundary is not displayed.
	await expect(page.locator(`img[src="${shipFallbackSrc}"]`)).not.toBeVisible()

	// Verify the h2 heading is set back to the first ship's name
	await expect(shipTitle).toHaveText(firstShipName)

	// Go forward in browser history
	await page.goForward()
	// Verify the root suspense boundary is not displayed.
	await expect(page.locator(`img[src="${shipFallbackSrc}"]`)).not.toBeVisible()

	// Verify the h2 heading is set back to the second ship's name
	await expect(shipTitle).toHaveText(secondShipName)
})
