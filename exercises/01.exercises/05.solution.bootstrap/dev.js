import { spawn } from 'node:child_process'
import chalk from 'chalk'
import closeWithGrace from 'close-with-grace'
import getPort from 'get-port'

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

const ssrServer = spawnScript(
	'node',
	['--watch', 'server/ssr.js'],
	{ PORT: SSR_PORT },
	chalk.blue.bgBlack('SSR'),
)

closeWithGrace(async () => {
	console.log('Shutting down servers...')
	const ssrExit = new Promise(resolve => ssrServer.on('exit', resolve))

	ssrServer.kill('SIGTERM')

	await Promise.all([ssrExit])
})
