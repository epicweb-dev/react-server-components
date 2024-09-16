import { test, expect } from '@playwright/test'

test('should display the home page and perform search', async ({ page }) => {
	await page.goto('/')
	await expect(page).toHaveTitle('Starship Deets')

	// Check for the filter input
	const filterInput = page.getByPlaceholder('filter ships')
	await expect(filterInput).toBeVisible()

	// Wait for the loading placeholders to disappear
	await page.waitForSelector('li a:has-text("... loading")', {
		state: 'detached',
	})

	// Verify that the list is populated with actual ship names
	const shipList = page.getByRole('list').first()
	await expect(shipList.getByRole('link').first()).not.toHaveText('... loading')

	// Perform a search
	await filterInput.fill('hopper')
	await filterInput.press('Enter')

	// Verify URL change with search params
	await expect(page).toHaveURL('/?search=hopper')

	// Check for loading indicators after search
	await expect(
		page.locator('li a:has-text("... loading")').first(),
	).toBeVisible()
	// Wait for the loading placeholders to disappear
	await page.waitForSelector('li a:has-text("... loading")', {
		state: 'detached',
	})

	// Verify filtered results
	const shipLinks = page
		.getByRole('list')
		.first()
		.getByRole('listitem')
		.getByRole('link')
	for (const link of await shipLinks.all()) {
		await expect(link).toContainText('hopper', { ignoreCase: true })
	}

	// Find and click on a ship in the filtered list
	const shipLink = shipLinks.first()
	const shipName = await shipLink.textContent()
	await shipLink.click()

	// Verify URL change
	await expect(page).toHaveURL(/\/[a-zA-Z0-9-]+/)

	// Verify ship detail view
	const shipTitle = page.getByRole('heading', { level: 2 })
	await expect(shipTitle).toHaveText(shipName)
})
