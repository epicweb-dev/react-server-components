import {
	createElement as h,
	use,
	useState,
	startTransition,
	useTransition,
} from 'react'
import ReactDOM from 'react-dom/client'
import { createFromFetch } from 'react-server-dom-esm/client'
import { RefreshRootContext } from './refresh.js'

let state = {}
const moduleBaseURL = '/src'
let updateRoot

// to avoid having to do this fetch to hydrate the app, you can use this:
// https://github.com/devongovett/rsc-html-stream
const initialSerializedJsxPromise = refresh()

async function refresh() {
	const params = new URLSearchParams(state)
	const root = await createFromFetch(
		fetch(`/?${params}`, { headers: { Accept: 'text/x-component' } }),
		{ moduleBaseURL },
	)
	return root
}

function Shell() {
	const [root, setRoot] = useState(use(initialSerializedJsxPromise))
	const [pendingState, setPendingState] = useState({
		previousState: null,
		nextState: null,
	})
	const [isPending, startTransition] = useTransition()

	updateRoot = setRoot
	return h(
		RefreshRootContext.Provider,
		{
			value: {
				nextState: pendingState.nextState,
				previousState: pendingState.previousState,
				isPending,
				refresh: async updates => {
					const previousState = state
					state = { ...state, ...updates }
					setPendingState({ previousState, nextState: state })
					const updatedData = await refresh()
					startTransition(() => updateRoot(updatedData))
				},
			},
		},
		root,
	)
}

await initialSerializedJsxPromise
startTransition(() => {
	ReactDOM.hydrateRoot(document, h(Shell))
})
