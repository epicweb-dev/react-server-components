import { spawn } from 'node:child_process'
import closeWithGrace from 'close-with-grace'
import getPort from 'get-port'

const PORT = await getPort({ port: Number(process.env.PORT || 3000) })

const ssrServer = spawn(
	'node',
	[
		'--watch',
		'--import',
		'./server/register-rsc-loader.js',
		'--conditions=react-server',
		'server/app.js',
	],
	{
		env: { ...process.env, PORT },
		stdio: 'inherit',
	},
)

closeWithGrace(async () => {
	console.log('Shutting down server...')
	const ssrExit = await new Promise(resolve => ssrServer.on('exit', resolve))

	ssrServer.kill('SIGTERM')

	await ssrExit
})
