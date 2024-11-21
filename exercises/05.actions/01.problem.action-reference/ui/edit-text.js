'use client'

// 🐨 bring in useActionState from 'react' here
import { createElement as h, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

const inheritStyles = {
	fontSize: 'inherit',
	fontStyle: 'inherit',
	fontWeight: 'inherit',
	fontFamily: 'inherit',
	textAlign: 'inherit',
}

// 🐨 accept an action prop
export function EditableText({ id, shipId, initialValue = '' }) {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState(initialValue)
	// 🐨 get formState, formAction, and isPending from useActionState from react
	// with the action from props
	const inputRef = useRef(null)
	const buttonRef = useRef(null)
	return h(
		'div',
		// 🐨 set the style prop on this div to decrease the opacity when the form is submitting
		// something like { opacity: isPending ? 0.6 : 1 } should work
		null,
		edit
			? h(
					'form',
					{
						// 🐨 add an action prop and set it to formAction
						onSubmit: event => {
							// 🐨 remove preventDefault here since the action handles this for you
							event.preventDefault()
							setValue(inputRef.current?.value ?? '')
							flushSync(() => {
								setEdit(false)
							})
							buttonRef.current?.focus()
						},
					},
					h('input', {
						type: 'hidden',
						name: 'shipId',
						value: shipId,
					}),
					h('input', {
						required: true,
						ref: inputRef,
						type: 'text',
						id: id,
						'aria-label': 'Ship Name',
						name: 'shipName',
						defaultValue: value,
						style: {
							border: 'none',
							background: 'none',
							width: '100%',
							...inheritStyles,
						},
						onKeyDown: event => {
							if (event.key === 'Escape') {
								flushSync(() => {
									setEdit(false)
								})
								buttonRef.current?.focus()
							}
						},
					}),
				)
			: h(
					'button',
					{
						ref: buttonRef,
						type: 'button',
						style: {
							border: 'none',
							background: 'none',
							...inheritStyles,
						},
						onClick: () => {
							flushSync(() => {
								setEdit(true)
							})
							inputRef.current?.select()
						},
					},
					value || 'Edit',
				),
		h(
			'div',
			{ position: 'relative' },
			// 🐨 if we have formState, then display the formState.message here in a div
			// 💯 make the color red if it's an error and green if it's not
			// 💰 here are some handy styles for you:
			// style: {
			// 	position: 'absolute',
			// 	left: 0,
			// 	right: 0,
			// 	color: formState.status === 'error' ? 'red' : 'green',
			// 	fontSize: '0.75rem',
			// 	fontWeight: 'normal',
			// },
		),
	)
}
