"use client";

import { Button } from "@/components/ui/button";
import { formatNgn } from "@/lib/currency";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { Spinner } from "@/components/ui/spinner";

export interface ScheduleRow {
  period: number;
  month: string;
  amount: number;
  dueDate: string;
  status: "paid" | "upcoming" | "pending" | "overdue" | "failed";
  isNextDue?: boolean;
}

interface UpcomingScheduleTableProps {
  schedule: ScheduleRow[];
  onPayNow: () => void;
  optimisticStatuses?: Record<number, "pending" | "failed">;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "border-emerald-200 bg-emerald-100 text-emerald-900",
  overdue: "border-red-200 bg-red-100 text-red-900",
  pending: "border-amber-200 bg-amber-100 text-amber-900",
  failed: "border-red-200 bg-red-100 text-red-900",
  upcoming: "border-primary/20 bg-primary/10 text-primary",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  overdue: "Overdue",
  pending: "Processing",
  failed: "Failed",
  upcoming: "Upcoming",
};

export function UpcomingScheduleTable({
  schedule,
  onPayNow,
  optimisticStatuses = {},
}: UpcomingScheduleTableProps) {
  const locale = useLocale();

  return (
    <div className="md:overflow-hidden md:rounded-3xl md:border-2 md:border-foreground/20 md:bg-card md:shadow-[4px_4px_0_rgba(26,26,26,0.05)]">
      <table
        className="stack-table w-full border-separate border-spacing-0 text-left"
        aria-label="Payment schedule"
      >
        <thead className="bg-muted text-sm uppercase tracking-[0.25em] text-muted-foreground">
          <tr>
            <th scope="col" className="px-6 py-4">Installment</th>
            <th scope="col" className="px-6 py-4">Due Date</th>
            <th scope="col" className="px-6 py-4">Amount</th>
            <th scope="col" className="px-6 py-4">Status</th>
            <th scope="col" className="px-6 py-4 sr-only">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => {
            const optimistic = optimisticStatuses[row.period];
            const effectiveStatus = (optimistic ?? row.status) as "paid" | "upcoming" | "pending" | "overdue" | "failed";
            const isProcessing = optimistic === "pending";
            const isFailed = optimistic === "failed";
            const isOverdue = effectiveStatus === "overdue";
            const isPaid = effectiveStatus === "paid";
            const formattedAmount = formatNgn(row.amount, locale);

            return (
              <tr
                key={`${row.period}-${row.month}`}
                className={`border-t border-foreground/10 ${
                  effectiveStatus === "overdue" || isFailed ? "bg-red-50" : "bg-background"
                }`}
              >
                <td data-label="Installment" className="px-6 py-4">
                  <div className="font-bold">{row.month}</div>
                  <div className="text-sm text-muted-foreground">Installment {row.period}</div>
                </td>
                <td data-label="Due" className="px-6 py-4">{row.dueDate}</td>
                <td data-label="Amount" className="px-6 py-4 font-mono font-bold">
                  {formattedAmount}
                </td>
                <td data-label="Status" className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${
                      STATUS_STYLES[effectiveStatus] ?? STATUS_STYLES.upcoming
                    }`}
                    aria-label={`Status: ${STATUS_LABELS[effectiveStatus] ?? effectiveStatus}`}
                  >
                    {isProcessing ? (
                      <Spinner size="xs" />
                    ) : isFailed || isOverdue ? (
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : isPaid ? (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {STATUS_LABELS[effectiveStatus] ?? effectiveStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {row.isNextDue && !optimistic ? (
                    <Button
                      onClick={onPayNow}
                      aria-label={`Pay installment ${row.period} - ${formattedAmount}`}
                      className="border-2 border-foreground bg-primary font-bold shadow-[4px_4px_0_rgba(26,26,26,1)]"
                    >
                      Pay Now
                    </Button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
