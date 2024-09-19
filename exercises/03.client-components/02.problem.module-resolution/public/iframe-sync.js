// this is for the epic workshop application integration. If you're looking at
// the app from the iframe in the workshop app, there's a URL bar in the app
// that needs to know what the current URL in the child app is, so this bit of
// code keeps them in sync.

if (window.parent !== window) {
	window.parent.postMessage(
		{ type: 'epicshop:loaded', url: window.location.href },
		'*',
	)
	function handleMessage(event) {
		const { type, params } = event.data
		if (type === 'epicshop:navigate-call') {
			const [distanceOrUrl, options] = params
			if (typeof distanceOrUrl === 'number') {
				window.history.go(distanceOrUrl)
			} else {
				if (options?.replace) {
					window.location.replace(distanceOrUrl)
				} else {
					window.location.assign(distanceOrUrl)
				}
			}
		}
	}

	window.addEventListener('message', handleMessage)

	const methods = ['pushState', 'replaceState', 'go', 'forward', 'back']
	for (const method of methods) {
		window.history[method] = new Proxy(window.history[method], {
			apply(target, thisArg, argArray) {
				window.parent.postMessage(
					{ type: 'epicshop:history-call', method, args: argArray },
					'*',
				)
				return target.apply(thisArg, argArray)
			},
		})
	}
}
