let count = 0

export async function increment(step = 1) {
	count += step
	return count
}

export async function decrement(step = 1) {
	count -= step
	return count
}

export async function getCount() {
	return count
}
