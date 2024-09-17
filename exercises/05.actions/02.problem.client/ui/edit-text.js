'use client'

import { createElement as h, useRef, useState, useActionState } from 'react'
import { flushSync } from 'react-dom'

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
	const [formState, formAction, isPending] = useActionState(action)
	const inputRef = useRef(null)
	const buttonRef = useRef(null)
	return h(
		'div',
		{ style: { opacity: isPending ? 0.6 : 1 } },
		edit
			? h(
					'form',
					{
						action: formAction,
						onSubmit: () => {
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
			formState
				? h(
						'div',
						{
							style: {
								position: 'absolute',
								left: 0,
								right: 0,
								color: formState.status === 'error' ? 'red' : 'green',
								fontSize: '0.75rem',
								fontWeight: 'normal',
							},
						},
						formState.message,
					)
				: null,
		),
	)
}
