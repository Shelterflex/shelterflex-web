"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/components/auth-guard";
import {
  listSafetyCases,
  reinstateWhistleblower,
  suspendWhistleblower,
  type SafetyCase,
} from "@/lib/api/whistleblowerSafetyAdmin";

type Filter = "suspended" | "watching" | "all";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function WhistleblowerSafetyPage() {
  return (
    <AuthGuard>
      <SafetyPanel />
    </AuthGuard>
  );
}

function SafetyPanel() {
  const [cases, setCases] = useState<SafetyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("suspended");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCases(await listSafetyCases());
    } catch (err) {
      setCases([]);
      setError(err instanceof Error ? err.message : "Failed to load safety reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(id: string, action: "suspend" | "reinstate") {
    if (
      action === "reinstate" &&
      !window.confirm("Reinstate this whistleblower? Their safety reports will be cleared.")
    ) {
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      await (action === "suspend" ? suspendWhistleblower(id) : reinstateWhistleblower(id));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const visible = cases.filter((c) =>
    filter === "all" ? true : filter === "suspended" ? c.suspended : !c.suspended,
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-3 border-foreground bg-card p-4 md:p-6">
        <div className="container mx-auto flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-black md:text-3xl">Whistleblower Safety</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Safety reports from tenants. Three reports from different people
              pause a whistleblower&apos;s reporting until you review them.
            </p>
          </div>
          <Link href="/admin/whistleblower-verification" className="text-sm font-bold underline">
            Applications panel
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-2">
          {(
            [
              ["suspended", "Suspended"],
              ["watching", "Reported, not suspended"],
              ["all", "All"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`border-2 border-foreground px-3 py-2 text-xs font-bold ${
                filter === value ? "bg-primary shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]" : "bg-card"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div role="alert" className="mb-4 flex items-center gap-2 border-3 border-destructive bg-destructive/10 p-4 text-sm font-bold text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" label="Loading" />
          </div>
        ) : visible.length === 0 ? (
          <Card className="border-3 border-dashed border-foreground p-10 text-center">
            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-bold">Nothing here</p>
            <p className="text-sm text-muted-foreground">No safety reports match this view.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {visible.map((c) => (
              <Card
                key={c.whistleblowerId}
                className={`border-3 p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6 ${
                  c.suspended ? "border-destructive" : "border-foreground"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold">
                      {c.suspended && <ShieldAlert className="h-5 w-5 text-destructive" />}
                      {c.name ?? "Unknown user"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {c.email ?? c.whistleblowerId}
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {c.distinctReporters} {c.distinctReporters === 1 ? "person has" : "different people have"} reported them
                      {c.suspended && c.suspendedAt ? ` · suspended ${formatDate(c.suspendedAt)}` : ""}
                    </p>
                  </div>
                  {c.suspended ? (
                    <Button
                      onClick={() => act(c.whistleblowerId, "reinstate")}
                      disabled={busyId === c.whistleblowerId}
                      className="border-3 border-foreground bg-secondary font-bold"
                    >
                      Reinstate
                    </Button>
                  ) : (
                    <Button
                      onClick={() => act(c.whistleblowerId, "suspend")}
                      disabled={busyId === c.whistleblowerId}
                      variant="outline"
                      className="border-3 border-destructive font-bold text-destructive"
                    >
                      Suspend now
                    </Button>
                  )}
                </div>

                <ul className="mt-4 space-y-2 border-t-2 border-foreground/10 pt-4">
                  {c.reports.map((r) => (
                    <li key={r.reportId} className="text-sm">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(r.createdAt)}
                        {r.listingId ? ` · listing ${r.listingId}` : ""}
                      </span>
                      <p>{r.details}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
