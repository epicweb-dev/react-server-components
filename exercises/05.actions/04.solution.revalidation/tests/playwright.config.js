import os from 'os'
import path from 'path'
import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PORT || '3000'

const tmpDir = path.join(os.tmpdir(), 'epicreact-server-components')

export default defineConfig({
	outputDir: path.join(tmpDir, 'playwright-test-output'),
	reporter: [
		[
			'html',
			{ open: 'never', outputFolder: path.join(tmpDir, 'playwright-report') },
		],
	],
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
