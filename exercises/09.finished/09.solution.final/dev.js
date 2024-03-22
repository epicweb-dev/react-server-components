import { spawn } from 'node:child_process'
import chalk from 'chalk'
import getPort, { portNumbers } from 'get-port'
import closeWithGrace from 'close-with-grace'

function spawnScript(command, args, env, prefix) {
	const script = spawn(command, args, {
		env: { ...process.env, ...env },
	})

	script.stdout.on('data', data => {
		process.stdout.write(`[${prefix}] ${data}`)
	})
	script.stderr.on('data', data => {
		process.stderr.write(`[${prefix} ${chalk.red.bgBlack('ERROR')}] ${data}`)
	})
	script.on('exit', code => {
		process.stdout.write(
			`[${prefix} ${chalk.yellow.bgBlack('exit')}]: ${code}\n`,
		)
		process.exit(code)
	})

	return script
}

const GLOBAL_PORT = await getPort({ port: Number(process.env.PORT || 3000) })
const REGION_PORT = await getPort({ port: portNumbers(9000, 9999) })
const API_ORIGIN = `http://localhost:${REGION_PORT}`

const globalServer = spawnScript(
	'node',
	['--watch', 'server/global.js'],
	{ PORT: GLOBAL_PORT, REGION_PORT: REGION_PORT, API_ORIGIN },
	chalk.blue.bgBlack('global'),
)

const regionalServer = spawnScript(
	'node',
	[
		'--watch',
		'--import',
		'./loader/register-region.js',
		'--conditions=react-server',
		'server/region.js',
	],
	{ PORT: REGION_PORT },
	chalk.green.bgBlack('region'),
)

closeWithGrace(async () => {
	console.log('Shutting down servers...')
	await Promise.all([globalServer.kill(), regionalServer.kill()])
})
