'use client'

import { createElement as h, useActionState } from 'react'

export function ActionButton({ action: actionReference, ...props }) {
	const [state, action, isPending] = useActionState(actionReference)
	console.log({ state, action, isPending })
	const children = isPending ? '...' : props.children
	return h('button', {
		onClick: () => action({ stuff: 'odd' }),
		...props,
		children,
	})
}
