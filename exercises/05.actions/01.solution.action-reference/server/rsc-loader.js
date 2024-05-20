import { resolve, load as reactLoad } from 'react-server-dom-esm/node-loader'

export { resolve }

async function textLoad(url, context, defaultLoad) {
	const result = await defaultLoad(url, context, defaultLoad)
	if (result.format === 'module') {
		if (typeof result.source === 'string') {
			return result
		}
		return {
			source: Buffer.from(result.source).toString('utf8'),
			format: 'module',
		}
	}
	return result
}

export async function load(url, context, defaultLoad) {
	const result = await reactLoad(url, context, (u, c) => {
		return textLoad(u, c, defaultLoad)
	})
	if (url.includes('actions.js')) {
		console.log(result.source)
	}
	return result
}
