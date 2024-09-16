import { test, expect } from '@playwright/test'

test('should display the home page', async ({ page }) => {
	await page.goto('/')
	await expect(page).toHaveTitle('Starship Deets')
})
