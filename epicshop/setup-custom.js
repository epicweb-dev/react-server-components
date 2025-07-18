import path from 'node:path'
import { warm } from '@epic-web/workshop-cli/warm'
import {
	getApps,
	isProblemApp,
	setPlayground,
} from '@epic-web/workshop-utils/apps.server'
import { $ } from 'execa'
import fsExtra from 'fs-extra'

await warm()

const allApps = await getApps()
const problemApps = allApps.filter(isProblemApp)

if (!process.env.SKIP_PLAYGROUND) {
	const firstProblemApp = problemApps[0]
	if (firstProblemApp) {
		console.log('🛝  setting up the first problem app...')
		const playgroundPath = path.join(process.cwd(), 'playground')
		if (await fsExtra.exists(playgroundPath)) {
			console.log('🗑  deleting existing playground app')
			await fsExtra.remove(playgroundPath)
		}
		await setPlayground(firstProblemApp.fullPath).then(
			() => {
				console.log('✅ first problem app set up')
			},
			(error) => {
				console.error(error)
				throw new Error('❌  first problem app setup failed')
			},
		)
	}
}

if (!process.env.SKIP_PLAYWRIGHT) {
	console.log(
		'🎭 installing playwright for testing... This may require sudo (or admin) privileges and may ask for your password. It will also take some time depending on whether you installed recently or have a slower network connection... Thanks for your patience!',
	)
	try {
		await $`npx playwright install chromium --with-deps`
		console.log('✅ playwright installed')
	} catch (error) {
		console.error('❌  playwright install failed:', error.message)
		throw error
	}
}
