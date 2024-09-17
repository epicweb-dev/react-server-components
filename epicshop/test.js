import path from 'node:path'
import { fileURLToPath } from 'url'
import {
	getApps,
	getAppDisplayName,
} from '@epic-web/workshop-utils/apps.server'
import enquirer from 'enquirer'
import { execa } from 'execa'
import { matchSorter } from 'match-sorter'
import pLimit from 'p-limit'

const { prompt } = enquirer

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function captureOutput() {
	const output = []
	return {
		write: (chunk, streamType) => {
			output.push({ chunk: chunk.toString(), streamType })
		},
		replay: () => {
			for (const { chunk, streamType } of output) {
				if (streamType === 'stderr') {
					process.stderr.write(chunk)
				} else {
					process.stdout.write(chunk)
				}
			}
		},
		hasOutput: () => output.length > 0,
	}
}

async function main() {
	const allApps = await getApps()

	let selectedApps
	let additionalArgs = []

	// Parse command-line arguments
	const argIndex = process.argv.indexOf('--')
	if (argIndex !== -1) {
		additionalArgs = process.argv.slice(argIndex + 1)
		process.argv = process.argv.slice(0, argIndex)
	}

	if (process.argv[2]) {
		const patterns = process.argv[2].toLowerCase().split(',')
		selectedApps = allApps.filter(app => {
			const { exerciseNumber, stepNumber, type } = app

			return patterns.some(pattern => {
				let [patternExercise = '*', patternStep = '*', patternType = '*'] =
					pattern.split('.')

				patternExercise ||= '*'
				patternStep ||= '*'
				patternType ||= '*'

				return (
					(patternExercise === '*' ||
						exerciseNumber === Number(patternExercise)) &&
					(patternStep === '*' || stepNumber === Number(patternStep)) &&
					(patternType === '*' || type.includes(patternType))
				)
			})
		})
	} else {
		const displayNameMap = new Map(
			allApps.map(app => [getAppDisplayName(app, allApps), app]),
		)
		const choices = displayNameMap.keys()

		const response = await prompt({
			type: 'autocomplete',
			name: 'appDisplayNames',
			message: 'Select apps to test:',
			choices: ['All', ...choices],
			multiple: true,
			suggest: (input, choices) => {
				return matchSorter(choices, input, { keys: ['name'] })
			},
		})

		selectedApps = response.appDisplayNames.includes('All')
			? allApps
			: response.appDisplayNames.map(appDisplayName =>
					displayNameMap.get(appDisplayName),
				)

		// Update this block to use process.argv
		const appPattern =
			selectedApps.length === allApps.length
				? '*'
				: selectedApps
						.map(app => `${app.exerciseNumber}.${app.stepNumber}.${app.type}`)
						.join(',')
		const additionalArgsString =
			additionalArgs.length > 0 ? ` -- ${additionalArgs.join(' ')}` : ''
		console.log(`\nℹ️  To skip the prompt next time, use this command:`)
		console.log(`npm test -- ${appPattern}${additionalArgsString}\n`)
	}

	if (selectedApps.length === 0) {
		console.log('⚠️ No apps selected. Exiting.')
		return
	}

	if (selectedApps.length === 1) {
		const app = selectedApps[0]
		console.log(`🚀 Running tests for ${app.relativePath}\n\n`)
		try {
			await execa('npm', ['run', 'test', '--silent', '--', ...additionalArgs], {
				cwd: app.fullPath,
				stdio: 'inherit',
				env: {
					...process.env,
					PORT: app.dev.portNumber,
				},
			})
		} catch {
			console.error(`❌ Tests failed for ${app.relativePath}`)
			process.exit(1)
		}
	} else {
		const limit = pLimit(4)
		let hasFailures = false
		const runningProcesses = new Map()
		let isShuttingDown = false

		const shutdownHandler = () => {
			if (isShuttingDown) return
			isShuttingDown = true
			console.log('\nGracefully shutting down. Please wait...')
			console.log('Outputting results of running tests:')
			for (const [app, output] of runningProcesses.entries()) {
				if (output.hasOutput()) {
					console.log(`\nPartial results for ${app.relativePath}:\n\n`)
					output.replay()
					console.log('\n\n')
				} else {
					console.log(`ℹ️  No output captured for ${app.relativePath}`)
				}
			}
			// Allow some time for output to be written before exiting
			setTimeout(() => process.exit(1), 100)
		}

		process.on('SIGINT', shutdownHandler)
		process.on('SIGTERM', shutdownHandler)

		const tasks = selectedApps.map(app =>
			limit(async () => {
				if (isShuttingDown) return
				console.log(`🚀 Starting tests for ${app.relativePath}`)
				const output = captureOutput()
				runningProcesses.set(app, output)
				try {
					const subprocess = execa(
						'npm',
						['run', 'test', '--silent', '--', ...additionalArgs],
						{
							cwd: path.join(__dirname, '..', app.relativePath),
							reject: false,
							env: {
								...process.env,
								PORT: app.dev.portNumber,
							},
						},
					)

					subprocess.stdout.on('data', chunk => output.write(chunk, 'stdout'))
					subprocess.stderr.on('data', chunk => output.write(chunk, 'stderr'))

					const { exitCode } = await subprocess

					runningProcesses.delete(app)

					if (exitCode !== 0) {
						hasFailures = true
						console.error(`\n❌ Tests failed for ${app.relativePath}:\n\n`)
						output.replay()
						console.log('\n\n')
					} else {
						console.log(`✅ Finished tests for ${app.relativePath}`)
					}
				} catch (error) {
					runningProcesses.delete(app)
					hasFailures = true
					console.error(
						`\n❌ An error occurred while running tests for ${app.relativePath}:\n\n`,
					)
					console.error(error.message)
					output.replay()
					console.log('\n\n')
				}
			}),
		)

		await Promise.all(tasks)

		if (hasFailures) {
			process.exit(1)
		}
	}
}

main().catch(error => {
	if (error) {
		console.error('❌ An error occurred:', error)
	}
	setTimeout(() => process.exit(1), 100)
})
