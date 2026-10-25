"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarCheck, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FIRST_HOUR,
  LAST_HOUR,
  hourLabel,
  requestViewing,
  slotToIso,
} from "@/lib/viewingsApi"
import { showErrorToast } from "@/lib/toast"

interface BookViewingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingId: string
}

const DAY_MS = 24 * 60 * 60 * 1000
const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, i) => FIRST_HOUR + i)

function dateInput(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * DAY_MS).toISOString().slice(0, 10)
}

/** Asks to see an apartment: daytime slots only, with at least a day's notice. */
export function BookViewingDialog({ open, onOpenChange, listingId }: BookViewingDialogProps) {
  const [date, setDate] = useState("")
  const [hour, setHour] = useState(FIRST_HOUR + 2)
  const [busy, setBusy] = useState(false)
  const [booked, setBooked] = useState(false)

  const submit = async () => {
    setBusy(true)
    try {
      await requestViewing({ listingId, startsAt: slotToIso(date, hour) })
      setBooked(true)
    } catch (error) {
      showErrorToast(error, "Could not book that viewing. Please try another time.")
    } finally {
      setBusy(false)
    }
  }

  const close = (next: boolean) => {
    if (!next) {
      setBooked(false)
      setDate("")
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="border-3 border-foreground shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] sm:max-w-md">
        {booked ? (
          <div className="py-4 text-center">
            <CalendarCheck className="mx-auto mb-3 h-10 w-10" />
            <h3 className="font-mono text-xl font-bold">Viewing requested</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve asked the person who listed it. You&apos;ll see the
              exact address once the viewing is confirmed.
            </p>
            <Link href="/viewings">
              <Button className="mt-4 border-3 border-foreground bg-primary font-bold">
                See my viewings
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-mono text-xl font-bold">Book a viewing</DialogTitle>
              <DialogDescription>
                Viewings are in the daytime, between 9am and 5pm, and need a
                day&apos;s notice.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <label htmlFor="viewing-date" className="mb-1 block text-sm font-bold">
                  Day
                </label>
                <input
                  id="viewing-date"
                  type="date"
                  value={date}
                  min={dateInput(1)}
                  max={dateInput(30)}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border-3 border-foreground bg-background px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="viewing-hour" className="mb-1 block text-sm font-bold">
                  Time (Lagos)
                </label>
                <select
                  id="viewing-hour"
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className="w-full border-3 border-foreground bg-background px-3 py-2"
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {hourLabel(h)}
                    </option>
                  ))}
                </select>
              </div>
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                For your safety we never share phone numbers. If the person who
                listed it is new to Shelterflex, a Shelterflex inspector comes
                along.
              </p>
            </div>

            <Button
              onClick={submit}
              disabled={busy || !date}
              className="w-full border-3 border-foreground bg-primary font-bold"
            >
              {busy ? "Booking…" : "Request viewing"}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
