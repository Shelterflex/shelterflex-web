"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Building2, CreditCard, RefreshCw, Wallet } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPropertyCard,
  type UserPropertyCardData,
} from "@/components/user-dashboard/UserPropertyCard";
import { ApplicationsTable } from "@/components/user-dashboard/ApplicationsTable";
import { WalletLedgerTable } from "@/components/user-dashboard/WalletLedgerTable";
import { fetchSavedListingIds } from "@/lib/savedPropertiesApi";
import { getProperty } from "@/lib/propertiesApi";
import { listTenantApplications, type TenantApplication } from "@/lib/tenantApi";
import {
  getMultiCurrencyBalance,
  getNgnLedger,
  type CurrencyBalance,
  type WalletLedgerEntry,
} from "@/lib/walletApi";
import { handleError } from "@/lib/toast";

const LEDGER_PAGE_SIZE = 20;

type LoadState<T> =
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; data: T };

type LedgerData = {
  entries: WalletLedgerEntry[];
  nextCursor: string | null;
};

function formatNgn(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong";
}

function SectionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border-2 border-foreground/20 bg-card py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center border-3 border-foreground bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <p className="font-bold">Could not load this section</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Button
        variant="outline"
        className="border-2 border-foreground"
        onClick={onRetry}
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}

export default function UserDashboardPage() {
  type TabValue = "my-properties" | "applications" | "wallet";

  const [activeTab, setActiveTab] = useState<TabValue>("my-properties");

  const [propertiesState, setPropertiesState] = useState<
    LoadState<UserPropertyCardData[]>
  >({ type: "loading" });
  const [applicationsState, setApplicationsState] = useState<
    LoadState<TenantApplication[]>
  >({ type: "loading" });
  const [balanceState, setBalanceState] = useState<LoadState<CurrencyBalance[]>>({
    type: "loading",
  });
  const [ledgerState, setLedgerState] = useState<LoadState<LedgerData>>({
    type: "loading",
  });
  const [isLoadingMoreLedger, setIsLoadingMoreLedger] = useState(false);

  const [propertiesReload, setPropertiesReload] = useState(0);
  const [applicationsReload, setApplicationsReload] = useState(0);
  const [walletReload, setWalletReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPropertiesState({ type: "loading" });

    (async () => {
      try {
        const ids = await fetchSavedListingIds();
        const properties = await Promise.all(
          ids.map(async (id) => {
            const res = await getProperty(id);
            const listing = res.data;
            const location =
              [listing.area, listing.city].filter(Boolean).join(", ") ||
              listing.address;
            return {
              id: listing.listingId,
              title: listing.address,
              location,
              priceNgnPerYear: listing.annualRentNgn,
            } satisfies UserPropertyCardData;
          })
        );
        if (!cancelled) {
          setPropertiesState({ type: "success", data: properties });
        }
      } catch (err) {
        if (!cancelled) {
          handleError(err, "Failed to load saved properties");
          setPropertiesState({ type: "error", message: errorMessage(err) });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [propertiesReload]);

  useEffect(() => {
    let cancelled = false;
    setApplicationsState({ type: "loading" });

    (async () => {
      try {
        const res = await listTenantApplications({ limit: 50 });
        if (!cancelled) {
          setApplicationsState({ type: "success", data: res.data });
        }
      } catch (err) {
        if (!cancelled) {
          handleError(err, "Failed to load applications");
          setApplicationsState({ type: "error", message: errorMessage(err) });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applicationsReload]);

  useEffect(() => {
    let cancelled = false;
    setBalanceState({ type: "loading" });
    setLedgerState({ type: "loading" });

    (async () => {
      try {
        const [balance, ledger] = await Promise.all([
          getMultiCurrencyBalance(),
          getNgnLedger({ limit: LEDGER_PAGE_SIZE }),
        ]);
        if (!cancelled) {
          setBalanceState({ type: "success", data: balance.balances });
          setLedgerState({
            type: "success",
            data: {
              entries: ledger.entries,
              nextCursor: ledger.nextCursor ?? null,
            },
          });
        }
      } catch (err) {
        if (!cancelled) {
          handleError(err, "Failed to load wallet data");
          const message = errorMessage(err);
          setBalanceState({ type: "error", message });
          setLedgerState({ type: "error", message });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [walletReload]);

  const loadMoreLedger = useCallback(async () => {
    if (
      ledgerState.type !== "success" ||
      !ledgerState.data.nextCursor ||
      isLoadingMoreLedger
    ) {
      return;
    }

    setIsLoadingMoreLedger(true);
    try {
      const res = await getNgnLedger({
        cursor: ledgerState.data.nextCursor,
        limit: LEDGER_PAGE_SIZE,
      });
      setLedgerState((prev) =>
        prev.type === "success"
          ? {
              type: "success",
              data: {
                entries: [...prev.data.entries, ...res.entries],
                nextCursor: res.nextCursor ?? null,
              },
            }
          : prev
      );
    } catch (err) {
      handleError(err, "Failed to load more transactions");
    } finally {
      setIsLoadingMoreLedger(false);
    }
  }, [ledgerState, isLoadingMoreLedger]);

  const ngnBalance =
    balanceState.type === "success"
      ? balanceState.data.find((b) => b.currency === "NGN")
      : undefined;
  const usdcBalance =
    balanceState.type === "success"
      ? balanceState.data.find((b) => b.currency === "USDC")
      : undefined;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="min-h-screen pt-20">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-2 md:mb-8">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Manage your saved properties, applications, and wallet.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <TabsList className="w-full md:w-fit">
              <TabsTrigger value="my-properties" className="flex-1 md:flex-none">
                <Building2 className="h-4 w-4" />
                My Properties
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex-1 md:flex-none">
                <CreditCard className="h-4 w-4" />
                Applications
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex-1 md:flex-none">
                <Wallet className="h-4 w-4" />
                Wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-properties" className="mt-4">
              {propertiesState.type === "loading" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              )}

              {propertiesState.type === "error" && (
                <SectionError
                  message={propertiesState.message}
                  onRetry={() => setPropertiesReload((n) => n + 1)}
                />
              )}

              {propertiesState.type === "success" &&
                propertiesState.data.length === 0 && (
                  <Empty className="border-2 border-foreground/20 bg-card">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Building2 />
                      </EmptyMedia>
                      <EmptyTitle>No saved properties yet</EmptyTitle>
                      <EmptyDescription>
                        Shortlist properties to see them here.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent />
                  </Empty>
                )}

              {propertiesState.type === "success" &&
                propertiesState.data.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {propertiesState.data.map((p) => (
                      <UserPropertyCard key={p.id} property={p} />
                    ))}
                  </div>
                )}
            </TabsContent>

            <TabsContent value="applications" className="mt-4">
              {applicationsState.type === "loading" && (
                <Skeleton className="h-64 w-full" />
              )}

              {applicationsState.type === "error" && (
                <SectionError
                  message={applicationsState.message}
                  onRetry={() => setApplicationsReload((n) => n + 1)}
                />
              )}

              {applicationsState.type === "success" &&
                applicationsState.data.length === 0 && (
                  <Empty className="border-2 border-foreground/20 bg-card">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <CreditCard />
                      </EmptyMedia>
                      <EmptyTitle>No applications yet</EmptyTitle>
                      <EmptyDescription>
                        When you submit rental applications, they will appear here.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent />
                  </Empty>
                )}

              {applicationsState.type === "success" &&
                applicationsState.data.length > 0 && (
                  <Card className="border-2 border-foreground/20">
                    <CardHeader>
                      <CardTitle>Submitted applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ApplicationsTable applications={applicationsState.data} />
                    </CardContent>
                  </Card>
                )}
            </TabsContent>

            <TabsContent value="wallet" className="mt-4">
              <div className="grid gap-4">
                {balanceState.type === "loading" && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                  </div>
                )}

                {balanceState.type === "error" && (
                  <SectionError
                    message={balanceState.message}
                    onRetry={() => setWalletReload((n) => n + 1)}
                  />
                )}

                {balanceState.type === "success" && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-2 border-foreground/20">
                      <CardHeader>
                        <CardTitle>NGN Available</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="font-mono text-2xl font-black text-primary">
                          {formatNgn(ngnBalance?.available ?? 0)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Held: {formatNgn(ngnBalance?.held ?? 0)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-foreground/20">
                      <CardHeader>
                        <CardTitle>USDC Available</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="font-mono text-2xl font-black text-primary">
                          {(usdcBalance?.available ?? 0).toFixed(2)} USDC
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Held: {(usdcBalance?.held ?? 0).toFixed(2)} USDC
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-foreground/20">
                      <CardHeader>
                        <CardTitle>Total</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">NGN</div>
                        <div className="font-mono font-black text-foreground">
                          {formatNgn(ngnBalance?.total ?? 0)}
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">
                          USDC
                        </div>
                        <div className="font-mono font-black text-foreground">
                          {(usdcBalance?.total ?? 0).toFixed(2)} USDC
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {ledgerState.type === "loading" && (
                  <Skeleton className="h-64 w-full" />
                )}

                {ledgerState.type === "error" && (
                  <SectionError
                    message={ledgerState.message}
                    onRetry={() => setWalletReload((n) => n + 1)}
                  />
                )}

                {ledgerState.type === "success" &&
                  ledgerState.data.entries.length === 0 && (
                    <Empty className="border-2 border-foreground/20 bg-card">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Wallet />
                        </EmptyMedia>
                        <EmptyTitle>No transactions yet</EmptyTitle>
                        <EmptyDescription>
                          Your wallet ledger entries will appear here.
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent />
                    </Empty>
                  )}

                {ledgerState.type === "success" &&
                  ledgerState.data.entries.length > 0 && (
                    <Card className="border-2 border-foreground/20">
                      <CardHeader>
                        <CardTitle>Transaction history</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <WalletLedgerTable
                          entries={ledgerState.data.entries}
                          hasMore={!!ledgerState.data.nextCursor}
                          isLoadingMore={isLoadingMoreLedger}
                          onLoadMore={loadMoreLedger}
                        />
                      </CardContent>
                    </Card>
                  )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
