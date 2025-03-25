import { test, expect } from '@playwright/test'
import { searchShips } from '../db/ship-api.js'

test('should display pending UI when performing a search and selecting a ship', async ({
	page,
}) => {
	const {
		ships: [firstShip],
	} = await searchShips({ search: '' })
	await page.goto(`/${firstShip.id}`)

	await page.waitForSelector('li a:has-text("... loading")', {
		state: 'detached',
	})

	// simulate a slow network for the /rsc endpoint so we force the pending UI to show up
	await page.route('/rsc/*', async (route) => {
		await new Promise((resolve) =>
			setTimeout(resolve, process.env.CI ? 1000 : 400),
		)
		await route.continue()
	})

	const searchInput = page.getByRole('searchbox', { name: /ships/i })
	await searchInput.fill('s')

	await expect(page.getByRole('list').first()).toHaveCSS('opacity', '0.6')

	await expect(page.getByRole('list').first()).toHaveCSS('opacity', '1')

	const firstShipLink = page.locator('li a').first()
	const shipName = await firstShipLink.textContent()
	await firstShipLink.click()

	await expect(page.locator('.details')).toHaveCSS('opacity', '0.6')

	await expect(page.locator('.details')).toHaveCSS('opacity', '1')

	const shipTitle = page.getByRole('heading', { level: 2 })
	await expect(shipTitle).toHaveText(shipName)
})
