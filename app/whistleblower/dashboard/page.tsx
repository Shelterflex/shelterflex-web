"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  DollarSign,
  Home,
} from "lucide-react";
import {
  getWhistleblowerDashboardData,
  type WhistleblowerDashboardData,
  type WhistleblowerListing,
} from "@/lib/api/whistleblowerDashboard";
import useAuthStore from "@/store/useAuthStore";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import {
  DashboardA11yEnhancer,
  DASHBOARD_MAIN_ID,
} from "@/components/dashboard/DashboardA11yEnhancer";
import { Spinner } from "@/components/ui/spinner";
import { hasAppliedAsWhistleblower } from "@/lib/api/whistleblowerApplications";
import {
  getIdentityStatus,
  type WhistleblowerIdentityStatus,
} from "@/lib/api/whistleblowerIdentity";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_LABEL: Record<WhistleblowerListing["status"], string> = {
  pending: "In review",
  active: "Live",
  rejected: "Rejected",
  rented: "✓ Rented",
};

const STATUS_COLOR: Record<WhistleblowerListing["status"], string> = {
  pending: "text-muted-foreground",
  active: "text-primary",
  rejected: "text-destructive",
  rented: "text-secondary",
};

export default function WhistleblowerDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WhistleblowerDashboardData | null>(null);
  const [applied, setApplied] = useState(true);
  const [identity, setIdentity] = useState<WhistleblowerIdentityStatus | null>(null);

  useEffect(() => {
    setApplied(hasAppliedAsWhistleblower());
    getIdentityStatus()
      .then(setIdentity)
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getWhistleblowerDashboardData();
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch whistleblower data:", err);
        setError(
          "We couldn't load your dashboard. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Spinner size="xl" className="mb-4" />
        <p className="font-mono text-lg font-bold">Loading your dashboard...</p>
      </div>
    );
  }

  // Use live data if available, otherwise show error
  const dashboardData = data?.stats;
  const listings = data?.listings || [];
  const earnings = data?.earnings || [];

  if (error && !data) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md w-full border-3 border-destructive bg-destructive/10 p-8 text-center shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
          <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h1 className="font-mono text-2xl font-black mb-2 text-destructive">
            Something Went Wrong
          </h1>
          <p className="text-destructive/80 mb-6">{error}</p>
          <Button
            className="w-full border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardA11yEnhancer />
      <DashboardHeader />

      <DashboardSidebar
        role="whistleblower"
        userInfo={{
          name: user?.name ?? "Whistleblower",
          roleLabel: "",
          extra: (
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-bold">{dashboardData.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({dashboardData.reviews} reviews)
              </span>
            </div>
          ),
        }}
      />

      {/* Main Content */}
      <main
        id={DASHBOARD_MAIN_ID}
        tabIndex={-1}
        className="min-h-screen pt-20 lg:ml-64"
      >
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
              Whistleblower Dashboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Report vacant apartments and earn ₦10-20k per successful rental
            </p>
          </div>

          {identity?.suspended && (
            <div role="alert" className="mb-8 border-3 border-destructive bg-destructive/10 p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <p className="font-bold text-destructive">Your reporting is paused</p>
              <p className="text-sm text-muted-foreground">
                We&apos;re reviewing safety reports about your account. Contact
                support to find out more.
              </p>
            </div>
          )}

          {identity && !identity.verified && !identity.suspended && (
            <div className="mb-8 flex flex-col gap-3 border-3 border-foreground bg-primary/20 p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold">Verify your identity to start reporting</p>
                <p className="text-sm text-muted-foreground">
                  A quick selfie match to your National ID. It keeps tenants and
                  reporters safe.
                </p>
              </div>
              <Link href="/whistleblower/verify">
                <Button className="border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  Verify now
                </Button>
              </Link>
            </div>
          )}

          {!applied && listings.length === 0 && (
            <div className="mb-8 flex flex-col gap-3 border-3 border-foreground bg-accent/20 p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold">Become a verified whistleblower</p>
                <p className="text-sm text-muted-foreground">
                  Apply to get verified so your reports are reviewed and your
                  earnings can be paid out.
                </p>
              </div>
              <Link href="/whistleblower/signup">
                <Button className="border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                  Apply now
                </Button>
              </Link>
            </div>
          )}

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            <Card className="border-3 border-foreground p-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground bg-primary md:h-14 md:w-14">
                  <DollarSign className="h-5 w-5 md:h-7 md:w-7" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground md:text-sm">
                    Total Earnings
                  </p>
                  <p className="truncate text-xl font-bold text-foreground md:text-3xl">
                    ₦{dashboardData.totalEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-3 border-foreground p-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground bg-secondary md:h-14 md:w-14">
                  <CheckCircle className="h-5 w-5 md:h-7 md:w-7" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground md:text-sm">
                    Reports This Month
                  </p>
                  <p className="truncate text-xl font-bold text-foreground md:text-3xl">
                    {dashboardData.reportsThisMonth}/
                    {dashboardData.maxReportsPerMonth}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-3 border-foreground p-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground bg-accent md:h-14 md:w-14">
                  <Home className="h-5 w-5 md:h-7 md:w-7" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground md:text-sm">
                    Active Listings
                  </p>
                  <p className="truncate text-xl font-bold text-foreground md:text-3xl">
                    {dashboardData.activeListings}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-3 border-foreground p-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground bg-muted md:h-14 md:w-14">
                  <TrendingUp className="h-5 w-5 md:h-7 md:w-7" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground md:text-sm">
                    Rating
                  </p>
                  <p className="truncate text-xl font-bold text-foreground md:text-3xl">
                    {dashboardData.rating}⭐
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Report Limit Warning */}
          {dashboardData.reportsThisMonth >=
            dashboardData.maxReportsPerMonth && (
            <div className="mb-8 border-3 border-destructive bg-red-100 p-4 rounded-sm">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-destructive mb-1">
                    Monthly Limit Reached
                  </p>
                  <p className="text-xs text-destructive/80">
                    You've reached your {dashboardData.maxReportsPerMonth}{" "}
                    apartment limit for this month. Come back next month to
                    report more.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active Listings */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-lg font-bold md:text-xl">
                Your Reports
              </h2>
              {dashboardData.reportsThisMonth <
                dashboardData.maxReportsPerMonth && (
                <Link href="/whistleblower/report">
                  <Button className="border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                    <Plus className="mr-2 h-4 w-4" />
                    Report Apartment
                  </Button>
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {listings.length === 0 ? (
                <div className="border-3 border-foreground border-dashed p-12 text-center bg-muted/30">
                  <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="font-mono text-lg font-bold">
                    No reports yet
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Report your first apartment to start earning!
                  </p>
                </div>
              ) : (
                listings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-foreground md:text-xl">
                          {listing.address}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₦{listing.price.toLocaleString()}/year •{" "}
                          {listing.beds} bed(s) • {listing.baths} bath(s)
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Posted: {formatDate(listing.postedDate)}
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 border-l-2 border-foreground pl-4">
                          <p className="text-xs text-muted-foreground">
                            Status
                          </p>
                          <div
                            className={`text-sm font-bold ${STATUS_COLOR[listing.status]}`}
                          >
                            {STATUS_LABEL[listing.status]}
                          </div>
                        </div>

                        {listing.status === "rented" && (
                          <div className="flex flex-col items-center gap-1 border-l-2 border-foreground pl-4">
                            <p className="text-xs text-muted-foreground">
                              Earned
                            </p>
                            <p className="text-lg font-bold text-primary">
                              ₦{listing.earnings.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Recent Earnings */}
          <div>
            <h2 className="font-mono text-lg font-bold mb-4 md:text-xl">
              Recent Earnings
            </h2>
            <div className="space-y-3">
              {earnings.length === 0 ? (
                <div className="border-3 border-foreground border-dashed p-8 text-center bg-muted/30">
                  <p className="text-muted-foreground italic">
                    No recent earnings records found.
                  </p>
                </div>
              ) : (
                earnings.map((earning, idx) => (
                  <Card
                    key={`${earning.listing}-${earning.date}-${idx}`}
                    className="border-3 border-foreground p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-bold">{earning.listing}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(earning.date)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-lg font-bold text-primary">
                          +₦{earning.amount.toLocaleString()}
                        </p>
                        <div
                          className={`flex items-center gap-1 px-3 py-1 border-2 border-foreground text-xs font-bold ${earning.status === "completed" ? "bg-secondary" : "bg-accent"}`}
                        >
                          {earning.status === "completed" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                          {earning.status === "completed"
                            ? "Completed"
                            : "Pending"}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
