import {
	createElement as h,
	use,
	useState,
	startTransition,
	useTransition,
} from 'react'
import ReactDOM from 'react-dom/client'
import { createFromFetch, encodeReply } from 'react-server-dom-esm/client'
import { RefreshRootContext } from './refresh.js'
import { ShipDetailsPendingContext } from './ship-details-pending.js'

let state = {}
const moduleBaseURL = '/src'
let updateRoot
async function callServer(id, args) {
	const params = new URLSearchParams(state)
	const response = fetch(`/?${params}`, {
		method: 'POST',
		headers: {
			Accept: 'text/x-component',
			'rsc-action': id,
		},
		body: await encodeReply(args),
	})
	const { returnValue, root } = await createFromFetch(response, {
		callServer,
		moduleBaseURL,
	})
	// Refresh the tree with the new RSC payload.
	startTransition(() => {
		updateRoot(root)
	})
	return returnValue
}

// to avoid having to do this fetch to hydrate the app, you can use this:
// https://github.com/devongovett/rsc-html-stream
const serializedJsx = refresh()

async function refresh() {
	const params = new URLSearchParams(state)
	const root = await createFromFetch(
		fetch(`/?${params}`, {
			headers: {
				Accept: 'text/x-component',
			},
		}),
		{ callServer, moduleBaseURL },
	)
	return root
}

function Shell({ serializedJsx }) {
	const [root, setRoot] = useState(use(serializedJsx))
	const [isShipDetailsPending, startShipDetailsTransition] = useTransition()
	updateRoot = setRoot
	return h(
		ShipDetailsPendingContext.Provider,
		{ value: isShipDetailsPending },
		h(
			RefreshRootContext.Provider,
			{
				value: async updates => {
					state = { ...state, ...updates }
					// 😆 not sure how to manage this better. The question is: how do I be
					// more fine-grained about what's getting updated?
					const wrapper =
						'shipId' in updates ? startShipDetailsTransition : cb => cb()
					const updatedData = await refresh()
					wrapper(() => {
						startTransition(() => {
							updateRoot(updatedData)
						})
					})
				},
			},
			root,
		),
	)
}

startTransition(() => {
	ReactDOM.hydrateRoot(document, h(Shell, { serializedJsx }))
})
