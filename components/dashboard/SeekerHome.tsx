"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle,
  Heart,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listMyViewings, type Viewing } from "@/lib/viewingsApi";

const ONBOARDING_STEPS = 5;

interface OnboardingStatus {
  completedSteps: string[];
  submitted: boolean;
}

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

/**
 * What a tenant without a lease sees: where their application stands, their
 * upcoming viewings, and the way to find a home. Lease and payment details
 * only appear once there is a lease.
 */
export function SeekerHome({
  onboarding,
}: {
  onboarding: OnboardingStatus | null;
}) {
  const [viewings, setViewings] = useState<Viewing[] | null>(null);

  useEffect(() => {
    listMyViewings()
      .then((all) =>
        setViewings(
          all.filter(
            (v) =>
              v.role === "tenant" &&
              (v.status === "requested" ||
                v.status === "awaiting_inspector" ||
                v.status === "confirmed") &&
              new Date(v.startsAt).getTime() > Date.now(),
          ),
        ),
      )
      .catch(() => setViewings([]));
  }, []);

  const done = onboarding?.completedSteps.length ?? 0;
  const progress = Math.round((done / ONBOARDING_STEPS) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold md:text-2xl">
          Let&apos;s find you a home
        </h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Finish your profile, view apartments, and apply when you find the one.
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <ShieldCheck className="h-5 w-5" /> Your application
          </h3>
          {onboarding?.submitted ? (
            <p className="flex items-start gap-2 text-sm">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
              Profile submitted. We&apos;ll notify you once it has been
              reviewed.
            </p>
          ) : (
            <>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Profile steps</span>
                <span className="font-bold">
                  {done} / {ONBOARDING_STEPS}
                </span>
              </div>
              <div className="mb-4 h-3 border-3 border-foreground bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <Link href="/onboarding">
                <Button className="w-full border-3 border-foreground bg-primary font-bold text-primary-foreground">
                  {done === 0 ? "Start your profile" : "Continue your profile"}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </Card>

        <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <CalendarCheck className="h-5 w-5" /> Upcoming viewings
          </h3>
          {viewings === null ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : viewings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No viewings booked. Pick an apartment and request a time.
            </p>
          ) : (
            <ul className="space-y-3">
              {viewings.slice(0, 3).map((v) => (
                <li key={v.viewingId} className="text-sm">
                  <p className="font-bold">{formatWhen(v.startsAt)}</p>
                  <p className="text-muted-foreground">
                    {v.place ?? "Location shared once confirmed"}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/viewings"
            className="mt-4 inline-block text-sm font-bold underline underline-offset-2"
          >
            All viewings
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/properties">
          <Card className="flex items-center gap-3 border-3 border-foreground p-5 hover:bg-muted">
            <Search className="h-6 w-6" />
            <div>
              <p className="font-bold">Find a home</p>
              <p className="text-sm text-muted-foreground">
                Browse verified apartments
              </p>
            </div>
          </Card>
        </Link>
        <Link href="/properties/saved">
          <Card className="flex items-center gap-3 border-3 border-foreground p-5 hover:bg-muted">
            <Heart className="h-6 w-6" />
            <div>
              <p className="font-bold">Saved homes</p>
              <p className="text-sm text-muted-foreground">
                Apartments you&apos;ve bookmarked
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
