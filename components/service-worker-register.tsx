'use client'

import { useEffect } from 'react'
import { flushOfflineQueue } from '@/lib/offline-queue'
import { getClientBackendUrl } from '@/lib/config/env'

const baseUrl = (() => {
  try {
    return getClientBackendUrl()
  } catch {
    return undefined
  }
})();

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // In development every edit changes chunk contents under unchanged URLs, so
    // a caching worker serves stale CSS and RSC payloads. Remove any worker a
    // previous session installed instead of registering one.
    if (process.env.NODE_ENV !== 'production') {
      void navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      )
      void caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key.startsWith('shelterflex-')).map((key) => caches.delete(key))),
      )
    } else {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const flushQueue = async () => {
      if (!baseUrl || !navigator.onLine) {
        return
      }

      await flushOfflineQueue(baseUrl)
    }

    void flushQueue()
    window.addEventListener('online', flushQueue)

    return () => {
      window.removeEventListener('online', flushQueue)
    }
  }, [])

  return null
}
