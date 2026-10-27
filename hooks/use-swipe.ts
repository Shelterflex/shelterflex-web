import { useRef } from "react"
import { tapHaptic } from "@/lib/haptics"

const MIN_DISTANCE = 40

/**
 * Horizontal swipe handlers for touch galleries. Spread the returned handlers
 * on the swipe surface. `wasSwipe()` tells a click handler on the same surface
 * that the gesture was a swipe, so it can skip opening things.
 */
export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)

  return {
    handlers: {
      onTouchStart: (e: React.TouchEvent) => {
        const t = e.touches[0]
        start.current = { x: t.clientX, y: t.clientY }
        swiped.current = false
      },
      onTouchEnd: (e: React.TouchEvent) => {
        if (!start.current) return
        const t = e.changedTouches[0]
        const dx = t.clientX - start.current.x
        const dy = t.clientY - start.current.y
        start.current = null
        // Mostly-vertical drags are page scrolls, not swipes.
        if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return
        swiped.current = true
        tapHaptic()
        if (dx < 0) onSwipeLeft()
        else onSwipeRight()
      },
    },
    wasSwipe: () => {
      const s = swiped.current
      swiped.current = false
      return s
    },
  }
}
