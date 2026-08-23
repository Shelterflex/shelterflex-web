"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Building2,
  Users,
  MessageSquare,
  DollarSign,
  MapPin,
  Bed,
  Bath,
  Square,
  MoreVertical,
  Edit,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { LandlordVerificationBadge, type LandlordVerificationLevel } from "@/components/LandlordVerificationBadge";
import { getCurrentUser } from "@/lib/authApi";
import { getTenants, getVerificationStatus } from "@/lib/landlordApi";
import {
  listLandlordProperties,
  type LandlordPropertyRecord,
  type LandlordPropertyStatus,
} from "@/lib/landlordPropertiesApi";
import { getPayoutSchedule, formatCurrency, type PayoutScheduleSummary } from "@/lib/landlordPayoutApi";

function formatLocation(property: LandlordPropertyRecord): string {
  const parts = [property.area, property.city].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : property.address;
}

const ACTIVE_STATUSES: LandlordPropertyStatus[] = ["active", "approved", "rented"];
const PENDING_STATUSES: LandlordPropertyStatus[] = ["pending", "pending_review"];

function statusPresentation(status: LandlordPropertyStatus): { label: string; className: string } {
  if (ACTIVE_STATUSES.includes(status)) {
    return { label: "Active", className: "bg-secondary" };
  }
  if (PENDING_STATUSES.includes(status)) {
    return { label: "Pending", className: "bg-accent" };
  }
  return { label: "Inactive", className: "bg-muted" };
}

function StatTile({
  icon: Icon,
  color,
  label,
  children,
}: {
  icon: React.ElementType;
  color: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-3 border-foreground p-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
      <div className="flex items-center gap-2 md:gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground md:h-14 md:w-14 ${color}`}
        >
          <Icon className="h-5 w-5 md:h-7 md:w-7" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">
            {label}
          </p>
          <div className="truncate text-xl font-bold text-foreground md:text-3xl">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function LandlordDashboard() {
  const [properties, setProperties] = useState<LandlordPropertyRecord[]>([]);
  const [propertiesTotal, setPropertiesTotal] = useState(0);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  const [tenantCount, setTenantCount] = useState<number | null>(null);
  const [payoutSummary, setPayoutSummary] = useState<PayoutScheduleSummary | null>(null);
  const [verificationLevel, setVerificationLevel] = useState<LandlordVerificationLevel | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPropertiesLoading(true);
      setPropertiesError(null);
      try {
        const res = await listLandlordProperties();
        if (!cancelled) {
          setProperties(res.properties);
          setPropertiesTotal(res.total);
        }
      } catch (err) {
        if (!cancelled) {
          setPropertiesError(err instanceof Error ? err.message : "Failed to load properties");
        }
      } finally {
        if (!cancelled) setPropertiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const me = await getCurrentUser();
        const [tenants, scheduleRes, verification] = await Promise.all([
          getTenants(),
          getPayoutSchedule(),
          getVerificationStatus(me.user.id),
        ]);
        if (!cancelled) {
          setTenantCount(tenants.length);
          setPayoutSummary(scheduleRes.data.summary);
          setVerificationLevel(verification.level);
        }
      } catch (err) {
        if (!cancelled) {
          setStatsError(err instanceof Error ? err.message : "Failed to load dashboard stats");
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <DashboardSidebar
        role="landlord"
        userInfo={{ name: "Chief Okonkwo", roleLabel: "Landlord" }}
      />

      {/* Main Content */}
      <main className="min-h-screen pt-20 lg:ml-64">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
                Welcome back!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base lg:text-lg">
                Here&apos;s what&apos;s happening with your properties
              </p>
            </div>
            <Link href="/dashboard/landlord/properties/new">
              <Button className="w-full border-3 border-foreground bg-primary px-4 py-4 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] md:w-auto md:px-6 md:py-6 md:text-lg">
                <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Add Property
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-4 md:gap-6">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card
                  key={`stats-loading-${index}`}
                  className="border-3 border-foreground p-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </Card>
              ))
            ) : statsError ? (
              <Card className="col-span-2 border-3 border-foreground bg-destructive/10 p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:col-span-4 md:p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                  <div>
                    <p className="font-bold">Stats are currently unavailable</p>
                    <p className="text-sm text-muted-foreground">{statsError}</p>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <StatTile icon={Building2} color="bg-primary" label="Properties">
                  {propertiesTotal}
                </StatTile>
                <StatTile icon={Users} color="bg-secondary" label="Tenants">
                  {tenantCount ?? 0}
                </StatTile>
                <StatTile icon={DollarSign} color="bg-accent" label="Total Payouts">
                  {payoutSummary
                    ? formatCurrency(payoutSummary.totalNet, payoutSummary.currency)
                    : formatCurrency(0)}
                </StatTile>
                <Card className="border-3 border-foreground p-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6">
                  <p className="mb-2 truncate text-xs font-medium text-muted-foreground md:text-sm">
                    Verification
                  </p>
                  {verificationLevel && <LandlordVerificationBadge level={verificationLevel} />}
                </Card>
              </>
            )}
          </div>

          {/* Properties */}
          <h2 className="mb-4 text-lg font-bold md:text-xl">Your Properties</h2>
          <div className="grid gap-6">
            {propertiesLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Card
                  key={`properties-loading-${index}`}
                  className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                >
                  <Skeleton className="mb-4 h-6 w-56" />
                  <Skeleton className="mb-2 h-4 w-40" />
                  <Skeleton className="h-32 w-full" />
                </Card>
              ))
            ) : propertiesError ? (
              <Card className="border-3 border-foreground bg-destructive/10 p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                  <div>
                    <p className="font-bold">Property data is unavailable</p>
                    <p className="text-sm text-muted-foreground">{propertiesError}</p>
                  </div>
                </div>
              </Card>
            ) : properties.length === 0 ? (
              <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <p className="font-bold">No properties yet</p>
                <p className="text-sm text-muted-foreground">
                  Add your first property to populate this panel.
                </p>
              </Card>
            ) : (
              properties.map((property) => {
                const { label: statusLabel, className: statusBadgeClassName } = statusPresentation(
                  property.status,
                );
                const photo = property.photos?.[0];

                return (
                  <Card
                    key={property.id}
                    className="border-3 border-foreground p-0 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  >
                    <div className="flex">
                      {/* Property Image */}
                      <div className="relative h-48 w-72 shrink-0 border-r-3 border-foreground bg-muted">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- remote photo URLs aren't in next.config's image allowlist
                          <img
                            src={photo}
                            alt={property.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Building2 className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                        <div
                          className={`absolute left-3 top-3 border-2 border-foreground px-3 py-1 text-sm font-bold ${statusBadgeClassName}`}
                        >
                          {statusLabel}
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-foreground">
                              {property.title}
                            </h3>
                            <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {formatLocation(property)}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="border-3 border-foreground bg-transparent"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border-3 border-foreground">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/landlord/properties/${property.id}/applications`}
                                  className="flex cursor-pointer items-center"
                                >
                                  <Users className="mr-2 h-4 w-4" /> View
                                  Applications
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/landlord/properties/${property.id}/edit`}
                                  className="flex cursor-pointer items-center"
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit Property
                                </Link>
                              </DropdownMenuItem>
                              {property.listingId && (
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/properties/${property.listingId}`}
                                    className="flex cursor-pointer items-center"
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> View Listing
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mb-4 flex gap-6">
                          <span className="flex items-center gap-1 text-sm font-medium">
                            <Bed className="h-4 w-4" /> {property.bedrooms} Beds
                          </span>
                          <span className="flex items-center gap-1 text-sm font-medium">
                            <Bath className="h-4 w-4" /> {property.bathrooms} Baths
                          </span>
                          {property.sqm != null && (
                            <span className="flex items-center gap-1 text-sm font-medium">
                              <Square className="h-4 w-4" /> {property.sqm} sqm
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <p className="text-2xl font-bold text-primary">
                              ₦{property.annualRentNgn.toLocaleString()}
                              <span className="text-sm font-normal text-muted-foreground">
                                /year
                              </span>
                            </p>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" /> {property.views} views
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />{" "}
                                {property.inquiries} inquiries
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
