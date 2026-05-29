import { describe, expect, it } from 'vitest'
import {
  deriveInstalmentStatus,
  buildScheduleView,
  summarizePayments,
  hasArrears,
  type InstalmentInput,
} from '@/lib/installmentSchedule'

const NOW = new Date('2026-06-15T00:00:00.000Z')

function inst(period: number, dueDate: string, paid: boolean, amountNgn = 100000): InstalmentInput {
  return { period, dueDate, amountNgn, paid }
}

describe('deriveInstalmentStatus', () => {
  it('labels paid instalments paid regardless of date', () => {
    expect(deriveInstalmentStatus(inst(1, '2026-01-01T00:00:00Z', true), NOW)).toBe('paid')
  })

  it('labels unpaid past-due instalments overdue', () => {
    expect(deriveInstalmentStatus(inst(1, '2026-05-01T00:00:00Z', false), NOW)).toBe('overdue')
  })

  it('labels unpaid instalments due within the window as due', () => {
    expect(deriveInstalmentStatus(inst(1, '2026-06-18T00:00:00Z', false), NOW)).toBe('due')
  })

  it('labels far-future unpaid instalments upcoming', () => {
    expect(deriveInstalmentStatus(inst(1, '2026-09-01T00:00:00Z', false), NOW)).toBe('upcoming')
  })
})

describe('buildScheduleView', () => {
  it('sorts by period and attaches status', () => {
    const view = buildScheduleView(
      [inst(3, '2026-09-01T00:00:00Z', false), inst(1, '2026-04-01T00:00:00Z', true), inst(2, '2026-05-01T00:00:00Z', false)],
      NOW,
    )
    expect(view.map((v) => v.period)).toEqual([1, 2, 3])
    expect(view.map((v) => v.status)).toEqual(['paid', 'overdue', 'upcoming'])
  })
})

describe('summarizePayments', () => {
  const schedule = [
    inst(1, '2026-03-01T00:00:00Z', true),
    inst(2, '2026-04-01T00:00:00Z', true),
    inst(3, '2026-05-01T00:00:00Z', false), // overdue
    inst(4, '2026-09-01T00:00:00Z', false), // upcoming
  ]

  it('matches paid/owed totals and progress', () => {
    const s = summarizePayments(schedule, NOW)
    expect(s.totalDue).toBe(400000)
    expect(s.totalPaid).toBe(200000)
    expect(s.outstanding).toBe(200000)
    expect(s.progressPercent).toBe(50)
    expect(s.monthsRemaining).toBe(2)
  })

  it('reports the next unpaid payment', () => {
    const s = summarizePayments(schedule, NOW)
    expect(s.nextPayment).toEqual({ period: 3, dueDate: '2026-05-01T00:00:00Z', amountNgn: 100000 })
  })

  it('computes arrears from overdue instalments', () => {
    const s = summarizePayments(schedule, NOW)
    expect(s.overdueSince).toBe('2026-05-01T00:00:00Z')
    expect(s.arrearsAmount).toBe(100000)
  })

  it('handles a fully paid schedule', () => {
    const paid = [inst(1, '2026-01-01T00:00:00Z', true), inst(2, '2026-02-01T00:00:00Z', true)]
    const s = summarizePayments(paid, NOW)
    expect(s.progressPercent).toBe(100)
    expect(s.nextPayment).toBeNull()
    expect(s.overdueSince).toBeNull()
    expect(s.arrearsAmount).toBe(0)
  })

  it('guards an empty schedule', () => {
    const s = summarizePayments([], NOW)
    expect(s.totalDue).toBe(0)
    expect(s.progressPercent).toBe(0)
    expect(s.nextPayment).toBeNull()
  })
})

describe('hasArrears', () => {
  it('is true when any instalment is overdue', () => {
    expect(hasArrears([inst(1, '2026-05-01T00:00:00Z', false)], NOW)).toBe(true)
    expect(hasArrears([inst(1, '2026-05-01T00:00:00Z', true)], NOW)).toBe(false)
  })
})
