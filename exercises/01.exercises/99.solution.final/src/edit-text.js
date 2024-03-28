'use client'

import { createElement as h, useRef, useState } from 'react'
import { useFormStatus, useFormState, flushSync } from 'react-dom'

const inheritStyles = {
	fontSize: 'inherit',
	fontStyle: 'inherit',
	fontWeight: 'inherit',
	fontFamily: 'inherit',
	textAlign: 'inherit',
}

export function EditableText({ id, shipId, action, initialValue = '' }) {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState(initialValue)
	const [formState, formAction] = useFormState(action, null)
	const inputRef = useRef(null)
	const buttonRef = useRef(null)
	return edit
		? h(
				'form',
				{
					action: formAction,
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
					h(PendingButton),
				),
				formState
					? h(
							'div',
							{
								style: {
									color: formState.status === 'error' ? 'red' : 'green',
									fontSize: '0.75rem',
									fontWeight: 'normal',
								},
							},
							formState.message,
						)
					: null,
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

function PendingButton() {
	const { pending } = useFormStatus()

	return h('button', { type: 'submit' }, pending ? '...' : 'Submit')
}
