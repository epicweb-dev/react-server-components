import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PORT || '3000'

export default defineConfig({
	reporter: [['html', { open: 'never' }]],
	use: {
		baseURL: `http://localhost:${PORT}/`,
		trace: 'retain-on-failure',
	},

	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
	],

	webServer: {
		command: process.env.CI ? 'npm run start' : 'npm run dev',
		port: Number(PORT),
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		stderr: 'pipe',
		env: { PORT },
	},
})
