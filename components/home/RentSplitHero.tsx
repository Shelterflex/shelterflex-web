"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react"
import { Check, ChevronRight } from "lucide-react"
import { Slider } from "@/components/ui/slider"

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
const DEPOSIT_RATE = 0.2
const MIN_RENT = 500_000
const MAX_RENT = 10_000_000

// One loop of the story: the whole bill sits there, cracks into monthly
// tiles, the tiles get paid off one by one, then the lease is stamped done.
type Phase = "whole" | "split" | "paying" | "done"
const PHASE_MS = { whole: 1600, split: 1100, tick: 380, done: 2200 }

const naira = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n)

const nairaShort = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M` : `₦${Math.round(n / 1000)}k`

/** Matches the calculator page: monthly = (rent − 20% deposit) / 12. */
function splitRent(rent: number) {
  const deposit = Math.round(rent * DEPOSIT_RATE)
  return { deposit, monthly: Math.round((rent - deposit) / 12) }
}

/** A number that glides to its new value instead of jumping. */
function RollingNaira({ value, className }: { value: number; className?: string }) {
  const reduceMotion = useReducedMotion()
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => naira(v))

  useEffect(() => {
    if (reduceMotion) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { type: "spring", stiffness: 140, damping: 22 })
    return () => controls.stop()
  }, [value, mv, reduceMotion])

  return <motion.span className={className}>{text}</motion.span>
}

export function RentSplitHero() {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.4 })

  const [rent, setRent] = useState(2_400_000)
  const [phase, setPhase] = useState<Phase>("whole")
  const [paid, setPaid] = useState(0)
  // Bumped whenever the visitor drags the slider, restarting the loop from the split.
  const [cycle, setCycle] = useState(0)

  const { deposit, monthly } = splitRent(rent)

  useEffect(() => {
    if (reduceMotion || !inView) return

    let timer: ReturnType<typeof setTimeout>
    const step = (next: Phase, delay: number, then?: () => void) => {
      timer = setTimeout(() => {
        setPhase(next)
        then?.()
      }, delay)
    }

    if (phase === "whole") step("split", PHASE_MS.whole)
    else if (phase === "split") step("paying", PHASE_MS.split)
    else if (phase === "paying") {
      timer = setTimeout(() => {
        if (paid < 12) setPaid((p) => p + 1)
        else setPhase("done")
      }, PHASE_MS.tick)
    } else step("whole", PHASE_MS.done, () => setPaid(0))

    return () => clearTimeout(timer)
  }, [phase, paid, cycle, inView, reduceMotion])

  const onRentChange = (value: number) => {
    setRent(value)
    setPaid(0)
    setPhase("split")
    setCycle((c) => c + 1)
  }

  // Reduced motion: show the finished split as a still frame.
  const showTiles = reduceMotion || phase !== "whole"
  const paidCount = reduceMotion ? 0 : paid

  return (
    <div ref={ref} className="relative">
      <div className="border-3 border-foreground bg-card p-5 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-muted-foreground">PAYMENT PREVIEW</span>
          <span className="flex items-center gap-1.5 border-2 border-foreground bg-secondary px-2 py-1 font-mono text-xs font-bold text-foreground">
            <span className="relative flex h-2 w-2">
              {!reduceMotion && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-60" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground" />
            </span>
            TRY IT
          </span>
        </div>

        <div className="border-b-2 border-dashed border-foreground/30 pb-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm text-muted-foreground">Annual Rent</p>
            <RollingNaira value={rent} className="font-mono text-2xl font-black sm:text-3xl" />
          </div>
          <Slider
            aria-label="Annual rent"
            value={[rent]}
            onValueChange={(v) => onRentChange(v[0])}
            min={MIN_RENT}
            max={MAX_RENT}
            step={100_000}
            className="pt-4 pb-1"
          />
        </div>

        <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
          <ChevronRight className="h-4 w-4" />
          <span>
            <span className="font-bold text-foreground">{naira(deposit)}</span> deposit, then 12 monthly payments
          </span>
        </div>

        {/* Fixed height so the card never jumps between the whole block and the tiles. */}
        <div className="relative h-[176px] sm:h-[188px]" aria-hidden="true">
          <AnimatePresence mode="wait" initial={false}>
            {!showTiles ? (
              <motion.div
                key="whole"
                className="absolute inset-0 flex flex-col items-center justify-center border-3 border-foreground bg-primary text-foreground"
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 18 } }}
                exit={{ scale: 1.04, opacity: 0, transition: { duration: 0.18 } }}
              >
                <span className="font-mono text-xs font-bold tracking-widest">ONE YEAR. ONE BILL.</span>
                <span className="font-mono text-3xl font-black sm:text-4xl">{naira(rent)}</span>
              </motion.div>
            ) : (
              <motion.div
                key="tiles"
                className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-1.5 sm:gap-2"
                initial="hidden"
                animate="shown"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                variants={{ shown: { transition: { staggerChildren: reduceMotion ? 0 : 0.035 } } }}
              >
                {MONTHS.map((month, i) => {
                  const isPaid = i < paidCount
                  const isNext = !reduceMotion && phase === "paying" && i === paidCount
                  // Tiles fly out from the middle of where the whole block sat.
                  const col = i % 4
                  const row = Math.floor(i / 4)
                  return (
                    <motion.div
                      key={month}
                      variants={{
                        hidden: { x: (1.5 - col) * 30, y: (1 - row) * 30, scale: 0.5, opacity: 0 },
                        shown: {
                          x: 0,
                          y: 0,
                          scale: 1,
                          opacity: 1,
                          transition: { type: "spring", stiffness: 380, damping: 20 },
                        },
                      }}
                      className={`relative flex flex-col justify-between border-2 border-foreground p-1.5 transition-colors duration-200 sm:p-2 ${
                        isPaid ? "bg-secondary text-foreground" : isNext ? "bg-primary/25" : "bg-background"
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold tracking-wider sm:text-xs">{month}</span>
                      <span className="font-mono text-xs font-black sm:text-sm">{nairaShort(monthly)}</span>
                      <AnimatePresence>
                        {isPaid && (
                          <motion.span
                            className="absolute right-1 top-1"
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 600, damping: 15 }}
                          >
                            <Check className="h-3 w-3 sm:h-4 sm:w-4" strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase === "done" && !reduceMotion && (
              <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span
                  className="border-3 border-foreground bg-accent px-4 py-2 font-mono text-lg font-black text-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  initial={{ scale: 2.2, rotate: -14 }}
                  animate={{ scale: 1, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 500, damping: 14 }}
                >
                  YEAR SORTED ✓
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress through the year, driven by the same tick as the tiles. */}
        <div className="mt-3 h-2 border-2 border-foreground bg-background">
          <motion.div
            className="h-full bg-secondary"
            animate={{ width: `${(reduceMotion ? 0 : paid / 12) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-3 border-foreground bg-primary/10 p-4">
          <div>
            <p className="text-sm text-muted-foreground">You pay monthly</p>
            <RollingNaira value={monthly} className="font-mono text-3xl font-black text-primary sm:text-4xl" />
          </div>
          <Link
            href={`/calculator?amount=${rent}`}
            className="whitespace-nowrap font-mono text-xs font-bold underline underline-offset-4 hover:text-primary"
          >
            Full breakdown →
          </Link>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">*Illustrative. Excludes inspection fee.</p>
      </div>

      <motion.div
        className="absolute -right-4 -top-4 h-16 w-16 border-3 border-foreground bg-accent"
        animate={reduceMotion ? undefined : { rotate: [0, 8, 0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-4 -left-4 h-12 w-12 border-3 border-foreground bg-secondary"
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}
