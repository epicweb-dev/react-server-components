import {
	createElement as h,
	startTransition,
	use,
	useEffect,
	useState,
	useTransition,
} from 'react'
import { createRoot } from 'react-dom/client'
import * as RSC from 'react-server-dom-esm/client'

const moduleBaseURL = '/js/src'

function updateContent() {
	console.error('updateContent called before it was set!')
}

function createFromFetch(fetchPromise) {
	return RSC.createFromFetch(fetchPromise, { moduleBaseURL, callServer })
}

async function callServer(id, args) {
	// using the global location to avoid a stale closure over the location
	const fetchPromise = fetch('/action', {
		method: 'POST',
		headers: {
			accept: 'text/x-component',
			'rsc-action': id,
		},
		body: await RSC.encodeReply(args),
	})
	const actionResponsePromise = createFromFetch(fetchPromise)
	updateContent(actionResponsePromise)
	const { returnValue } = await actionResponsePromise
	return returnValue
}

let initialContentPromise = createFromFetch(fetch('/rsc'))

export function Root() {
	const [contentPromise, setContentPromise] = useState(initialContentPromise)
	const [isPending, startTransition] = useTransition()

	// update the updateContent function to the latest every render
	useEffect(() => {
		updateContent = newContent => {
			startTransition(() => setContentPromise(newContent))
		}
	})

	return use(contentPromise).root
}

startTransition(() => {
	createRoot(document.getElementById('root')).render(h(Root))
})
