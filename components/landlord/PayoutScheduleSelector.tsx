"use client";

import { useState, useEffect } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  getPayoutPreferences,
  savePayoutPreferences,
  type PayoutSchedule,
} from "@/lib/landlordPayoutApi";

interface PayoutScheduleSelectorProps {
  /** Fallback used only while preferences are loading for the first time. */
  initialSchedule?: PayoutSchedule;
}

export function PayoutScheduleSelector({
  initialSchedule = "monthly",
}: PayoutScheduleSelectorProps) {
  const [schedule, setSchedule] = useState<PayoutSchedule>(initialSchedule);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load current preferences from the real backend on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getPayoutPreferences()
      .then((prefs) => {
        if (!cancelled) setSchedule(prefs.schedule);
      })
      .catch(() => {
        // Silently fall back to initialSchedule; the user can still change it
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleScheduleChange = async (value: string) => {
    const newSchedule = value as PayoutSchedule;
    const previous = schedule;
    setSchedule(newSchedule);
    setIsSaving(true);

    try {
      await savePayoutPreferences({ schedule: newSchedule });
      toast.success("Payout schedule updated successfully");
    } catch (error) {
      toast.error("Failed to update payout schedule. Please try again.");
      // Revert optimistic update
      setSchedule(previous);
    } finally {
      setIsSaving(false);
    }
  };

  const busy = isLoading || isSaving;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Payout Schedule
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose when you want to receive your payouts.
          </p>
        </div>
        {busy && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <RadioGroup.Root
        className="flex flex-col space-y-3"
        value={schedule}
        onValueChange={handleScheduleChange}
        disabled={busy}
      >
        {(
          [
            { value: "activation", label: "On Deal Activation" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
          ] as { value: PayoutSchedule; label: string }[]
        ).map(({ value, label }) => (
          <div key={value} className="flex items-center space-x-2">
            <RadioGroup.Item
              value={value}
              id={value}
              className="peer h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary"
            >
              <RadioGroup.Indicator className="flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary-foreground" />
              </RadioGroup.Indicator>
            </RadioGroup.Item>
            <label
              htmlFor={value}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          </div>
        ))}
      </RadioGroup.Root>
    </div>
  );
}
