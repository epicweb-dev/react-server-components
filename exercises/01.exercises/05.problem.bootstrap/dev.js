import { spawn } from 'node:child_process'
import chalk from 'chalk'
import closeWithGrace from 'close-with-grace'
import getPort, { portNumbers } from 'get-port'

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
	})

	return script
}

const SSR_PORT = await getPort({ port: Number(process.env.PORT || 3000) })
const RSC_PORT = await getPort({ port: portNumbers(9000, 9999) })

const ssrServer = spawnScript(
	'node',
	['--watch', 'server/ssr.js'],
	{ PORT: SSR_PORT, RSC_PORT },
	chalk.blue.bgBlack('SSR'),
)

const rscServer = spawnScript(
	'node',
	['--watch', '--conditions=react-server', 'server/rsc.js'],
	{ PORT: RSC_PORT },
	chalk.green.bgBlack('RSC'),
)

closeWithGrace(async () => {
	console.log('Shutting down servers...')
	const ssrExit = new Promise(resolve => ssrServer.on('exit', resolve))
	const rscExit = new Promise(resolve => rscServer.on('exit', resolve))

	ssrServer.kill('SIGTERM')
	rscServer.kill('SIGTERM')

	await Promise.all([ssrExit, rscExit])
})
