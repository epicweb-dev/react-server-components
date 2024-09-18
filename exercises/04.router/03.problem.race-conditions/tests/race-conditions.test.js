import { test, expect } from '@playwright/test'

test('should not update URL for out-of-order responses', async ({ page }) => {
	await page.goto('/')

	// Simulate varying network delays
	await page.route('/rsc/*', async route => {
		const url = route.request().url()
		if (url.includes('search=st')) {
			await new Promise(resolve => setTimeout(resolve, 2000)) // Longer delay for 'st'
		}
		await route.continue()
	})

	const searchInput = page.getByRole('searchbox', { name: /ships/i })

	// Perform rapid searches
	await searchInput.fill('s')
	await searchInput.fill('st')
	await searchInput.fill('sta')

	// Wait for the last search to complete
	await page.waitForURL('**/*?search=sta')

	// Wait for all in-flight requests to finish
	await page.waitForLoadState('networkidle')

	// Check that the URL ends with 'sta', not 'st'
	expect(page.url()).toMatch(/search=sta$/)
})
