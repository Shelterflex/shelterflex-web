"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarCheck, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/components/auth-guard";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  cancelViewing,
  claimViewing,
  listMyViewings,
  listViewingsNeedingInspector,
  respondToViewing,
  type Viewing,
  type ViewingStatus,
} from "@/lib/viewingsApi";

const STATUS_LABEL: Record<ViewingStatus, string> = {
  requested: "Waiting for a reply",
  awaiting_inspector: "Waiting for an inspector",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ViewingsPage() {
  return (
    <AuthGuard>
      <ViewingsList />
    </AuthGuard>
  );
}

function ViewingsList() {
  const { user } = useCurrentUser();
  const isInspector = user?.role === "inspector";
  const [mine, setMine] = useState<Viewing[]>([]);
  const [open, setOpen] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setMine(await listMyViewings());
      setOpen(isInspector ? await listViewingsNeedingInspector() : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your viewings.");
    } finally {
      setLoading(false);
    }
  }, [isInspector]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(id: string, action: () => Promise<unknown>) {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const active = (v: Viewing) => v.status !== "declined" && v.status !== "cancelled";

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-black">Viewings</h1>
        <p className="mb-6 flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Viewings are daytime only and arranged here, so nobody has to share a
          phone number. The exact address appears once a viewing is confirmed.
        </p>

        {error && (
          <div role="alert" className="mb-4 flex items-center gap-2 border-3 border-destructive bg-destructive/10 p-3 text-sm font-bold text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" label="Loading" />
          </div>
        ) : (
          <>
            {isInspector && (
              <section className="mb-10">
                <h2 className="mb-3 font-mono text-lg font-bold">Needs an inspector</h2>
                {open.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing is waiting for an inspector.</p>
                ) : (
                  <div className="space-y-3">
                    {open.map((v) => (
                      <Card key={v.viewingId} className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                        <p className="font-bold">{formatWhen(v.startsAt)}</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {v.address ?? v.place}
                        </p>
                        <p className="mt-1 text-sm">
                          {v.tenantFirstName} is viewing; listed by {v.reporterFirstName}, who is new to Shelterflex.
                        </p>
                        <Button
                          onClick={() => run(v.viewingId, () => claimViewing(v.viewingId))}
                          disabled={busyId === v.viewingId}
                          className="mt-3 border-3 border-foreground bg-primary font-bold"
                        >
                          I&apos;ll attend
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section>
              <h2 className="mb-3 font-mono text-lg font-bold">Your viewings</h2>
              {mine.length === 0 ? (
                <Card className="border-3 border-dashed border-foreground p-10 text-center">
                  <CalendarCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-bold">No viewings yet</p>
                  <p className="text-sm text-muted-foreground">
                    Open an apartment and choose &ldquo;Book a viewing&rdquo;.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {mine.map((v) => (
                    <Card key={v.viewingId} className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-bold">{formatWhen(v.startsAt)}</p>
                        <span
                          className={`border-2 border-foreground px-2 py-0.5 text-xs font-bold ${
                            v.status === "confirmed" ? "bg-secondary" : active(v) ? "bg-accent" : "bg-muted"
                          }`}
                        >
                          {STATUS_LABEL[v.status]}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {v.address ?? v.place ?? "Address shared once confirmed"}
                      </p>
                      <p className="mt-1 text-sm">
                        {v.role === "tenant" && `Listed by ${v.reporterFirstName}.`}
                        {v.role === "reporter" && `${v.tenantFirstName} would like to see your apartment.`}
                        {v.role === "inspector" && `${v.tenantFirstName} is viewing; listed by ${v.reporterFirstName}.`}
                        {v.requiresInspector && v.role !== "inspector" &&
                          (v.inspectorAssigned
                            ? " A Shelterflex inspector will attend."
                            : " A Shelterflex inspector will attend once one is assigned.")}
                      </p>

                      {active(v) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {v.role === "reporter" && v.status === "requested" && (
                            <>
                              <Button
                                onClick={() => run(v.viewingId, () => respondToViewing(v.viewingId, "accept"))}
                                disabled={busyId === v.viewingId}
                                className="border-3 border-foreground bg-primary font-bold"
                              >
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => run(v.viewingId, () => respondToViewing(v.viewingId, "decline"))}
                                disabled={busyId === v.viewingId}
                                className="border-3 border-foreground font-bold"
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {v.role !== "inspector" && (
                            <Button
                              variant="outline"
                              onClick={() => run(v.viewingId, () => cancelViewing(v.viewingId))}
                              disabled={busyId === v.viewingId}
                              className="border-2 border-destructive font-bold text-destructive"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
