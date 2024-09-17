import { test, expect } from '@playwright/test'

test('should display the home page and perform client-side routing', async ({
	page,
}) => {
	await page.goto('/')
	let reloadCount = 0

	// Listen for 'load' event which triggers on page reload
	page.on('load', () => {
		reloadCount++
	})

	// Wait for the page to load
	await page.waitForSelector('a')

	// Get the first link
	const firstLink = await page.locator('a').first()

	// Get the href attribute of the first link
	const href = await firstLink.getAttribute('href')

	// Click the first link
	await firstLink.click()

	// Wait for the URL to change
	await page.waitForURL(`**${href}`)

	// Verify the URL has updated
	expect(page.url()).toContain(href)

	// Verify no reloads occurred
	expect(reloadCount).toBe(0)
})
