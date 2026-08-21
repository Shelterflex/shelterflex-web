"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Building2,
  Users,
  MessageSquare,
  MapPin,
  Bed,
  Bath,
  Square,
  MoreVertical,
  Edit,
  Trash2,
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
import { landlordApi, type LandlordTenant } from "@/lib/landlordApi";
import { listLandlordProperties, type LandlordPropertyRecord } from "@/lib/landlordPropertiesApi";
import { getPayoutSchedule } from "@/lib/landlordPayoutApi";

interface DashboardStat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function formatNgn(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
}

function mapStatus(
  status: string,
): { label: string; badgeClass: string } {
  const activeStatuses = ["active", "approved", "rented"];
  const pendingStatuses = ["pending", "pending_review"];
  if (activeStatuses.includes(status)) {
    return { label: "Active", badgeClass: "bg-secondary" };
  }
  if (pendingStatuses.includes(status)) {
    return { label: "Pending", badgeClass: "bg-accent" };
  }
  return { label: "Inactive", badgeClass: "bg-muted" };
}

export default function LandlordDashboard() {
  const [activeTab, setActiveTab] = useState<"properties" | "applications">(
    "properties",
  );

  // Data states
  const [properties, setProperties] = useState<LandlordPropertyRecord[]>([]);
  const [propertiesTotal, setPropertiesTotal] = useState(0);
  const [tenants, setTenants] = useState<LandlordTenant[]>([]);
  const [payoutNet, setPayoutNet] = useState<number>(0);

  // Loading states
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingPayouts, setLoadingPayouts] = useState(true);

  // Error states
  const [propertiesError, setPropertiesError] = useState(false);
  const [tenantsError, setTenantsError] = useState(false);
  const [payoutsError, setPayoutsError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      // Fetch properties
      try {
        const propsResp = await listLandlordProperties({ page: 1 });
        if (!cancelled) {
          setProperties(propsResp.properties || []);
          setPropertiesTotal(propsResp.total || 0);
          setLoadingProperties(false);
        }
      } catch {
        if (!cancelled) {
          setPropertiesError(true);
          setLoadingProperties(false);
        }
      }

      // Fetch tenants
      try {
        const tenantsData = await landlordApi.getTenants();
        if (!cancelled) {
          setTenants(Array.isArray(tenantsData) ? tenantsData : []);
          setLoadingTenants(false);
        }
      } catch {
        if (!cancelled) {
          setTenantsError(true);
          setLoadingTenants(false);
        }
      }

      // Fetch payout schedule
      try {
        const payoutResp = await getPayoutSchedule({ pageSize: 1 });
        if (!cancelled && payoutResp?.data?.summary) {
          setPayoutNet(payoutResp.data.summary.totalNet);
          setLoadingPayouts(false);
        } else if (!cancelled) {
          setLoadingPayouts(false);
        }
      } catch {
        if (!cancelled) {
          setPayoutsError(true);
          setLoadingPayouts(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  const isLoading = loadingProperties || loadingTenants || loadingPayouts;

  const activePropertiesCount = useMemo(
    () => properties.filter((p) =>
      ["active", "approved", "rented"].includes(p.status),
    ).length,
    [properties],
  );

  const stats: DashboardStat[] = useMemo(
    () => [
      {
        label: "Total Properties",
        value: String(propertiesTotal),
        icon: Building2,
        color: "bg-primary",
      },
      {
        label: "Active Listings",
        value: String(activePropertiesCount),
        icon: Users,
        color: "bg-secondary",
      },
      {
        label: "Current Tenants",
        value: String(tenants.length),
        icon: Users,
        color: "bg-accent",
      },
      {
        label: "Total Payouts",
        value: payoutNet > 0 ? formatNgn(payoutNet) : "₦0",
        icon: MessageSquare,
        color: "bg-primary",
      },
    ],
    [propertiesTotal, activePropertiesCount, tenants.length, payoutNet],
  );

  const hasError = propertiesError && tenantsError && payoutsError;

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
                Welcome back, Chief!
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
            {isLoading ? (
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
            ) : hasError ? (
              <Card className="col-span-2 border-3 border-foreground bg-destructive/10 p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:col-span-4 md:p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                  <div>
                    <p className="font-bold">Stats are currently unavailable</p>
                    <p className="text-sm text-muted-foreground">
                      We couldn&apos;t load dashboard stats right now.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              stats.map((stat) => (
                <Card
                  key={stat.label}
                  className="border-3 border-foreground p-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:p-6"
                >
                  <div className="flex items-center gap-2 md:gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center border-3 border-foreground md:h-14 md:w-14 ${stat.color}`}
                    >
                      <stat.icon className="h-5 w-5 md:h-7 md:w-7" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">
                        {stat.label}
                      </p>
                      <p className="truncate text-xl font-bold text-foreground md:text-3xl">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-2 md:gap-4">
            <button
              onClick={() => setActiveTab("properties")}
              className={`border-3 border-foreground px-3 py-2 text-sm font-bold transition-all md:px-6 md:py-3 md:text-base ${
                activeTab === "properties"
                  ? "bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                  : "bg-card hover:bg-muted"
              }`}
            >
              Properties
            </button>
          </div>

          {/* Properties Tab */}
          {activeTab === "properties" && (
            <div className="grid gap-6">
              {loadingProperties ? (
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
                      <p className="text-sm text-muted-foreground">
                        We couldn&apos;t load your property panel right now.
                      </p>
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
                  const { label: statusLabel, badgeClass: statusBadgeClassName } =
                    mapStatus(property.status);

                  return (
                    <Card
                      key={property.id}
                      className="border-3 border-foreground p-0 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                    >
                      <div className="flex">
                        {/* Property Image */}
                        <div className="relative h-48 w-72 shrink-0 border-r-3 border-foreground bg-muted">
                          <div className="flex h-full items-center justify-center">
                            <Building2 className="h-16 w-16 text-muted-foreground" />
                          </div>
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
                                {property.address}
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
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" /> Edit Property
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" /> View Listing
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
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
                            {property.sqm && (
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
          )}
        </div>
      </main>
    </div>
  );
}