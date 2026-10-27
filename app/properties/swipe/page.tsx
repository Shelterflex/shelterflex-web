"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bath, Bed, Heart, Home, Info, LayoutGrid, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { propertyListingToCard, type PropertyCardData } from "@/components/property-card"
import { searchProperties } from "@/lib/propertiesApi"
import { fetchSavedListingIds, setListingSaved } from "@/lib/savedPropertiesApi"
import { formatNgn } from "@/lib/currency"
import { tapHaptic } from "@/lib/haptics"
import { showErrorToast } from "@/lib/toast"
import { celebrate } from "@/lib/celebrate"
import useAuthStore from "@/store/useAuthStore"

const FLING_PX = 110
const PLAN_MONTHS = 12

type Decision = { id: string; saved: boolean }

function monthly(p: PropertyCardData) {
  return Math.round((p.installmentBasePriceNgn ?? p.annualRentNgn) / (p.installmentPlanMonths ?? PLAN_MONTHS))
}

function location(p: PropertyCardData) {
  return [p.area, p.city].filter(Boolean).join(", ") || "Nigeria"
}

/**
 * Swipe through homes one at a time: right (or ♥) saves, left (or ✕) skips.
 * Tapping the card opens the listing. Arrow keys work too.
 */
export default function SwipeHomesPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [deck, setDeck] = useState<PropertyCardData[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<Decision[]>([])
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const seen = useRef(new Set<string>())

  const load = useCallback(async (nextPage: number) => {
    setLoading(true)
    try {
      const [result, savedIds] = await Promise.all([
        searchProperties({ sortBy: "newest", page: nextPage, pageSize: 20 }),
        isAuthenticated ? fetchSavedListingIds().catch(() => [] as string[]) : Promise.resolve([] as string[]),
      ])
      savedIds.forEach((id) => seen.current.add(id))
      const fresh = result.data.map((listing) => propertyListingToCard(listing)).filter((p) => !seen.current.has(p.listingId))
      fresh.forEach((p) => seen.current.add(p.listingId))
      setDeck((d) => [...d, ...fresh])
      setPage(nextPage)
      setTotalPages(result.totalPages)
    } catch (error) {
      showErrorToast(error, "Couldn't load homes. Pull down to try again.")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void load(1)
  }, [load])

  const current = deck[0]
  const savedCount = history.filter((h) => h.saved).length

  // Keep the deck topped up before it runs dry.
  useEffect(() => {
    if (!loading && deck.length < 3 && page < totalPages) void load(page + 1)
  }, [deck.length, loading, page, totalPages, load])

  const decide = useCallback(
    (saved: boolean) => {
      if (!current || leaving) return
      tapHaptic()
      setLeaving(saved ? "right" : "left")
      const property = current
      window.setTimeout(() => {
        setDeck((d) => d.slice(1))
        setHistory((h) => [...h, { id: property.listingId, saved }])
        setLeaving(null)
        setDrag({ x: 0, y: 0, active: false })
      }, 220)
      if (saved) {
        const nextSaved = savedCount + 1
        if (nextSaved === 1 || nextSaved % 5 === 0) celebrate()
        if (isAuthenticated) {
          setListingSaved(property.listingId, true).catch((error) => showErrorToast(error, "Couldn't save that home."))
        }
      }
    },
    [current, leaving, isAuthenticated, savedCount],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") decide(true)
      if (e.key === "ArrowLeft") decide(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [decide])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    start.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ x: 0, y: 0, active: true })
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return
    setDrag({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.3, active: true })
  }
  const onPointerUp = () => {
    if (!start.current) return
    start.current = null
    if (drag.x > FLING_PX) return decide(true)
    if (drag.x < -FLING_PX) return decide(false)
    // A tap, not a drag: open the listing.
    if (Math.abs(drag.x) < 6 && Math.abs(drag.y) < 6 && current) {
      router.push(`/properties/${current.listingId}`)
      return
    }
    setDrag({ x: 0, y: 0, active: false })
  }

  const offsetX = leaving === "right" ? 600 : leaving === "left" ? -600 : drag.x
  const intent = offsetX > 40 ? "save" : offsetX < -40 ? "skip" : null

  return (
    <main className="container mx-auto flex min-h-[calc(100dvh-5rem)] max-w-md flex-col overflow-x-clip px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-black">Swipe Homes</h1>
          <p className="text-sm text-muted-foreground">Right to save · left to skip · tap for details</p>
        </div>
        <Link
          href="/properties"
          aria-label="Back to list view"
          className="flex h-11 w-11 shrink-0 items-center justify-center border-3 border-foreground bg-background shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
        >
          <LayoutGrid className="h-5 w-5" />
        </Link>
      </div>

      <div className="relative flex-1" style={{ minHeight: "26rem" }}>
        {/* Next card peeks out underneath for depth. */}
        {deck[1] && (
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-y-3 scale-[0.96] border-3 border-foreground bg-card"
          />
        )}

        {current ? (
          <div
            role="group"
            aria-roledescription="swipe card"
            data-no-ptr
            aria-label={`${current.address}, ${location(current)}`}
            className="absolute inset-0 flex cursor-grab touch-none select-none flex-col overflow-hidden border-3 border-foreground bg-card shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] active:cursor-grabbing"
            style={{
              transform: `translate(${offsetX}px, ${drag.y}px) rotate(${offsetX / 18}deg)`,
              transition: drag.active && !leaving ? "none" : "transform 220ms ease-out",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="relative flex-1 bg-muted">
              {current.photos?.[0] ? (
                <Image
                  src={current.photos[0]}
                  alt=""
                  fill
                  sizes="(max-width: 448px) 100vw, 448px"
                  className="pointer-events-none object-cover"
                  draggable={false}
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Home className="h-16 w-16 text-muted-foreground" aria-hidden="true" />
                </div>
              )}

              {intent && (
                <span
                  className={`absolute top-6 border-3 px-3 py-1 font-mono text-2xl font-black uppercase ${
                    intent === "save"
                      ? "left-6 -rotate-12 border-secondary bg-secondary/90 text-foreground"
                      : "right-6 rotate-12 border-destructive bg-destructive/90 text-white"
                  }`}
                >
                  {intent === "save" ? "Save" : "Nope"}
                </span>
              )}
            </div>

            <div className="space-y-2 border-t-3 border-foreground p-4">
              <p className="font-mono text-2xl font-black">
                {formatNgn(monthly(current))}
                <span className="text-sm font-medium text-muted-foreground">/mo</span>
              </p>
              <p className="line-clamp-1 font-bold">{current.address}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {location(current)}
                </span>
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" aria-hidden="true" />
                  {current.bedrooms} bed
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" aria-hidden="true" />
                  {current.bathrooms} bath
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border-3 border-dashed border-foreground/40 p-6 text-center">
            {loading ? (
              <p className="font-mono font-bold">Finding homes…</p>
            ) : (
              <>
                <p className="font-mono text-xl font-black">You&apos;ve seen every home 🎉</p>
                <p className="text-sm text-muted-foreground">
                  {savedCount > 0
                    ? `You saved ${savedCount} ${savedCount === 1 ? "home" : "homes"}.`
                    : "Nothing caught your eye? Try the full list with filters."}
                </p>
                {savedCount > 0 && !isAuthenticated ? (
                  <Link href="/signup?returnTo=/properties/swipe">
                    <Button className="border-3 border-foreground bg-primary font-bold">Sign up to keep your saves</Button>
                  </Link>
                ) : (
                  <Link href={savedCount > 0 ? "/properties/saved" : "/properties"}>
                    <Button className="border-3 border-foreground bg-primary font-bold">
                      {savedCount > 0 ? "See saved homes" : "Browse the list"}
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => decide(false)}
          disabled={!current}
          aria-label="Skip this home"
          className="flex h-16 w-16 items-center justify-center rounded-full border-3 border-foreground bg-background text-destructive shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] disabled:opacity-40"
        >
          <X className="h-8 w-8" />
        </button>
        <button
          type="button"
          onClick={() => current && router.push(`/properties/${current.listingId}`)}
          disabled={!current}
          aria-label="View details"
          className="flex h-12 w-12 items-center justify-center rounded-full border-3 border-foreground bg-background shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] disabled:opacity-40"
        >
          <Info className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => decide(true)}
          disabled={!current}
          aria-label="Save this home"
          className="flex h-16 w-16 items-center justify-center rounded-full border-3 border-foreground bg-primary shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] disabled:opacity-40"
        >
          <Heart className="h-8 w-8 fill-current" />
        </button>
      </div>

      {history.length > 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground" aria-live="polite">
          {history.length} seen · {savedCount} saved
        </p>
      )}
    </main>
  )
}
