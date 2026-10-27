import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PaymentStreakCard, onTimeStreak } from "@/components/payment/PaymentStreakCard"
import type { PaymentScheduleItem } from "@/lib/tenantApi"

const row = (period: number, status: PaymentScheduleItem["status"], dueDate: string, paidDate?: string): PaymentScheduleItem => ({
  period,
  month: `M${period}`,
  amount: 100000,
  dueDate,
  status,
  paidDate,
})

describe("onTimeStreak", () => {
  it("counts consecutive on-time payments back from the latest", () => {
    const schedule = [
      row(1, "paid", "2026-01-01", "2026-01-10"), // late, before the streak
      row(2, "paid", "2026-02-01", "2026-01-30"),
      row(3, "paid", "2026-03-01", "2026-03-01"),
      row(4, "paid", "2026-04-01", "2026-04-01T20:00:00Z"), // within grace day
      row(5, "upcoming", "2026-05-01"),
    ]
    expect(onTimeStreak(schedule)).toBe(3)
  })

  it("is broken by an overdue installment", () => {
    expect(onTimeStreak([row(1, "paid", "2026-01-01", "2026-01-01"), row(2, "overdue", "2026-02-01")])).toBe(0)
  })

  it("trusts paid rows with unparseable dates", () => {
    expect(onTimeStreak([row(1, "paid", "Due soon"), row(2, "paid", "Due soon")])).toBe(2)
  })
})

describe("PaymentStreakCard", () => {
  it("shows the streak and the next badge to unlock", () => {
    render(<PaymentStreakCard schedule={[row(1, "paid", "2026-01-01", "2026-01-01")]} />)
    expect(screen.getByText(/on-time payment$/)).toBeInTheDocument()
    expect(screen.getByText(/2 more to unlock “Hat-trick”/)).toBeInTheDocument()
    expect(screen.getByText("(earned)")).toBeInTheDocument()
  })
})
