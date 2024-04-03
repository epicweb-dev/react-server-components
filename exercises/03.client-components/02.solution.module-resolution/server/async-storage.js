import { AsyncLocalStorage } from 'node:async_hooks'

export const shipDataStorage = new AsyncLocalStorage()
