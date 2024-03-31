'use server'

import * as db from '../db/count.js'

export async function increment() {
	await db.increment(1)
	return { status: 'success', message: 'Success!' }
}

export async function decrement() {
	await db.decrement(1)
	return { status: 'success', message: 'Success!' }
}
