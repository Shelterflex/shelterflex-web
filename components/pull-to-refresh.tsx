'use client'

import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { tapHaptic } from '@/lib/haptics'

const THRESHOLD = 80
const MAX_PULL = 120

// Body sets overscroll-behavior-y: contain, which also switches off the
// browser's own pull-to-refresh (and standalone PWAs have none), so provide it.
// It never calls preventDefault, so normal scrolling is untouched.
export function PullToRefresh() {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const pullRef = useRef(0)

  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return

    const reset = () => {
      startY.current = null
      pullRef.current = 0
      setPull(0)
    }

    const onStart = (e: TouchEvent) => {
      const target = e.target as Element | null
      // Only from the very top of the page, and never inside dialogs, drawers
      // or inner scroll areas where the drag means something else.
      const blocked = target?.closest('[role="dialog"], [data-no-ptr], [aria-modal="true"], aside, .snap-row, textarea, input')
      startY.current = window.scrollY <= 0 && !blocked && e.touches.length === 1 ? e.touches[0].clientY : null
    }

    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0 || window.scrollY > 0) return reset()
      // Rubber-band: the further you pull, the heavier it gets.
      pullRef.current = Math.min(MAX_PULL, dy * 0.5)
      setPull(pullRef.current)
    }

    const onEnd = () => {
      if (pullRef.current >= THRESHOLD) {
        tapHaptic()
        setRefreshing(true)
        window.location.reload()
        return
      }
      reset()
    }

    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd)
    document.addEventListener('touchcancel', reset)
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', reset)
    }
  }, [])

  if (pull <= 0 && !refreshing) return null

  const ready = pull >= THRESHOLD
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-1/2 top-2 z-[70] -translate-x-1/2"
      style={{ transform: `translate(-50%, ${refreshing ? 24 : pull * 0.6}px)` }}
    >
      <div className="flex h-10 w-10 items-center justify-center border-3 border-foreground bg-primary shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
        <RefreshCw
          className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
          style={refreshing ? undefined : { transform: `rotate(${pull * 3}deg)`, opacity: ready ? 1 : 0.7 }}
        />
      </div>
    </div>
  )
}
