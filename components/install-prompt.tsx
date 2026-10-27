'use client'

import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'shelterflex:install-dismissed-at'
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

function isSnoozed() {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY))
    return at > 0 && Date.now() - at < SNOOZE_MS
  } catch {
    return false
  }
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// iOS Safari has no install event; the only route is Share > Add to Home Screen.
function isIosSafari() {
  const ua = navigator.userAgent
  const ios = /iphone|ipad|ipod/i.test(ua)
  return ios && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIos, setShowIos] = useState(false)

  useEffect(() => {
    if (isStandalone() || isSnoozed()) return

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setDeferred(null)

    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    // Let the page settle before nagging iOS visitors.
    const timer = isIosSafari() ? window.setTimeout(() => setShowIos(true), 4000) : undefined

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    } catch {
      // storage unavailable; the prompt simply returns next visit
    }
    setDeferred(null)
    setShowIos(false)
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  if (!deferred && !showIos) return null

  return (
    <div
      role="dialog"
      aria-label="Install Shelterflex"
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[60] border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-sm lg:bottom-4"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="pr-8 font-mono text-sm font-black uppercase">Install Shelterflex</p>
      {deferred ? (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Add it to your home screen for faster access and offline support.
          </p>
          <Button
            onClick={install}
            className="mt-3 w-full min-h-11 border-3 border-foreground bg-primary font-bold text-foreground"
          >
            <Download className="mr-2 h-4 w-4" />
            Install app
          </Button>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          Tap <Share className="mx-0.5 inline h-4 w-4 align-text-bottom" /> Share, then{' '}
          <strong>Add to Home Screen</strong>.
        </p>
      )}
    </div>
  )
}
