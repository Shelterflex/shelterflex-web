import { Flame, Trophy } from "lucide-react"
import type { PaymentScheduleItem } from "@/lib/tenantApi"

const GRACE_MS = 24 * 60 * 60 * 1000

const MILESTONES = [
  { count: 1, label: "First rent", emoji: "🔑" },
  { count: 3, label: "Hat-trick", emoji: "🎯" },
  { count: 6, label: "Half-year hero", emoji: "⚡" },
  { count: 12, label: "Year of rent", emoji: "🏆" },
] as const

function paidOnTime(item: PaymentScheduleItem) {
  if (item.status !== "paid") return false
  const paid = item.paidDate ? Date.parse(item.paidDate) : NaN
  const due = Date.parse(item.dueDate)
  // Missing or unparseable dates: trust "paid" rather than punish the tenant.
  if (Number.isNaN(paid) || Number.isNaN(due)) return true
  return paid <= due + GRACE_MS
}

/** Consecutive on-time payments, counting back from the latest settled one. */
export function onTimeStreak(schedule: PaymentScheduleItem[]) {
  const settled = schedule
    .filter((p) => p.status === "paid" || p.status === "overdue")
    .sort((a, b) => b.period - a.period)
  let streak = 0
  for (const p of settled) {
    if (!paidOnTime(p)) break
    streak++
  }
  return streak
}

export function PaymentStreakCard({ schedule }: { schedule: PaymentScheduleItem[] }) {
  const streak = onTimeStreak(schedule)
  const next = MILESTONES.find((m) => m.count > streak)

  return (
    <section
      aria-label="On-time payment streak"
      className="border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
    >
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className={`flex h-12 w-12 shrink-0 items-center justify-center border-3 border-foreground ${
            streak > 0 ? "bg-primary" : "bg-muted"
          }`}
        >
          <Flame className={`h-6 w-6 ${streak > 0 ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}`} />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-2xl font-black leading-none">
            {streak} <span className="text-base">on-time {streak === 1 ? "payment" : "payments"}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {next
              ? `${next.count - streak} more to unlock “${next.label}” ${next.emoji}`
              : "Every badge unlocked. Legendary renter!"}
          </p>
        </div>
      </div>

      <ul className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Badges">
        {MILESTONES.map((m) => {
          const earned = streak >= m.count
          return (
            <li
              key={m.count}
              className={`flex shrink-0 items-center gap-1.5 border-2 px-2.5 py-1.5 font-mono text-xs font-bold ${
                earned ? "border-foreground bg-accent text-foreground" : "border-dashed border-foreground/30 text-muted-foreground"
              }`}
            >
              <span aria-hidden="true" className={earned ? "" : "grayscale opacity-50"}>
                {m.emoji}
              </span>
              {m.label}
              <span className="sr-only">{earned ? "(earned)" : `(needs ${m.count})`}</span>
              {earned && m.count === 12 && <Trophy className="h-3.5 w-3.5" aria-hidden="true" />}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
