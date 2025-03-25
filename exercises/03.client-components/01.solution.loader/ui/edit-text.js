'use client'

import { createElement as h, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

const inheritStyles = {
	fontSize: 'inherit',
	fontStyle: 'inherit',
	fontWeight: 'inherit',
	fontFamily: 'inherit',
	textAlign: 'inherit',
}

export function EditableText({ id, shipId, initialValue = '' }) {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState(initialValue)
	const inputRef = useRef(null)
	const buttonRef = useRef(null)
	return h(
		'div',
		null,
		edit
			? h(
					'form',
					{
						onSubmit: (event) => {
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
						onKeyDown: (event) => {
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
	)
}
