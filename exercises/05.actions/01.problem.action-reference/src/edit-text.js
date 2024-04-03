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
	return edit
		? h(
				'form',
				{
					// 🐨 add an action prop and set it to formAction
					onSubmit: () => {
						setValue(inputRef.current?.value ?? '')
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
				h(
					'div',
					{ style: { display: 'flex', gap: 2, justifyContent: 'center' } },
					h(
						'button',
						{ type: 'button', onClick: () => setEdit(false) },
						'Done editing',
					),
					h(
						'button',
						{ type: 'submit' },
						// 🐨 if we're pending, then make the text contents '...'
						'Submit',
					),
				),
				// 🐨 if we have formState, then display the formState.message here in a div
				// 💯 make the color red if it's an error and green if it's not
			)
		: h(
				'button',
				{
					'aria-label': 'Ship Name',
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
			)
}
