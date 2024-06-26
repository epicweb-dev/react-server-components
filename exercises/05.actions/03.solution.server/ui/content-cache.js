import { useSyncExternalStore } from 'react'

/**
 * This will call the given callback function whenever the contents of the map
 * change.
 */
class ObservableMap extends Map {
	listeners = new Set()
	set(key, value) {
		const result = super.set(key, value)
		this.emitChange()
		return result
	}
	delete(key) {
		const result = super.delete(key)
		this.emitChange()
		return result
	}
	emitChange() {
		for (const listener of this.listeners) {
			listener()
		}
	}
	subscribe(listener) {
		this.listeners.add(listener)
		return () => {
			this.listeners.delete(listener)
		}
	}
}

export const contentCache = new ObservableMap()

export function generateKey() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useContentCache() {
	function subscribe(cb) {
		return contentCache.subscribe(cb)
	}
	function getSnapshot() {
		return contentCache
	}
	return useSyncExternalStore(subscribe, getSnapshot)
}
