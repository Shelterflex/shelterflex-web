import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import type { WalletLedgerEntry, WalletLedgerStatus } from "@/lib/walletApi";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatNgn(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

const KNOWN_TYPE_LABELS: Record<string, string> = {
  top_up: "Top up",
  withdrawal: "Withdrawal",
  staking_conversion: "Staking conversion",
  staking_reserve: "Staking reserve",
  staking_debit: "Staking debit",
  staking_refund: "Staking refund",
  reversal: "Reversal",
  reward: "Reward",
};

function typeLabel(type: string) {
  if (KNOWN_TYPE_LABELS[type]) return KNOWN_TYPE_LABELS[type];
  const normalized = type.trim().replaceAll("_", " ");
  if (!normalized) return "Activity";
  return normalized
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function statusPresentation(status: WalletLedgerStatus) {
  switch (status) {
    case "confirmed":
      return { label: "Confirmed", variant: "secondary" as const };
    case "pending":
      return { label: "Pending", variant: "default" as const };
    case "approved":
      return { label: "Approved", variant: "secondary" as const };
    case "rejected":
      return { label: "Rejected", variant: "destructive" as const };
    case "failed":
      return { label: "Failed", variant: "destructive" as const };
    default:
      return { label: status, variant: "outline" as const };
  }
}

export function WalletLedgerTable({
  entries,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: {
  entries: WalletLedgerEntry[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>When</TableHead>
            <TableHead>Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => {
            const status = statusPresentation(e.status);
            const isCredit = e.amountNgn > 0;
            return (
              <TableRow key={e.id}>
                <TableCell className="font-bold text-foreground">
                  {typeLabel(e.type)}
                </TableCell>
                <TableCell>
                  <div
                    className={`font-mono font-bold ${
                      isCredit ? "text-secondary" : "text-destructive"
                    }`}
                  >
                    {isCredit ? "+" : "-"}
                    {formatNgn(Math.abs(e.amountNgn))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(e.timestamp)}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {e.reference ?? "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="border-2 border-foreground"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
