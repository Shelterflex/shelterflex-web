"use client"

import { useState } from "react"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitSafetyReport } from "@/lib/api/whistleblowerIdentity"
import { showSuccessToast, showErrorToast } from "@/lib/toast"

interface SafetyReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listingId: string
}

/** Lets a tenant tell us the person who listed this apartment made them feel unsafe. */
export function SafetyReportDialog({ open, onOpenChange, listingId }: SafetyReportDialogProps) {
  const [details, setDetails] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    try {
      await submitSafetyReport({ listingId, details })
      showSuccessToast("Thank you. We take safety reports seriously and will review this.")
      setDetails("")
      onOpenChange(false)
    } catch (error) {
      showErrorToast(error, "Could not send your report. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-3 border-foreground shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono text-xl font-bold">
            <ShieldAlert className="h-5 w-5" />I felt unsafe
          </DialogTitle>
          <DialogDescription>
            Tell us what happened with the person who listed this apartment. If
            you are in danger right now, leave and call the police on 112 first.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="safety-details" className="font-bold">
            What happened?
          </Label>
          <Textarea
            id="safety-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="For example: they asked me to come alone at night, or to meet somewhere other than the apartment."
            className="border-3 border-foreground"
          />
        </div>
        <Button
          onClick={submit}
          disabled={busy || details.trim().length < 10}
          className="w-full border-3 border-foreground bg-destructive font-bold text-destructive-foreground"
        >
          {busy ? "Sending…" : "Send safety report"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
