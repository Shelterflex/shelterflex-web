"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { dashboardsFor, isInDashboard, rememberDashboard } from "@/lib/dashboardPath";

/**
 * Tabs for moving between the dashboards the signed-in user has, e.g. their
 * tenant dashboard and their whistleblower dashboard. Hidden when there is
 * only one. Also remembers the open dashboard so "Dashboard" returns to it.
 */
export function DashboardSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const dashboards = dashboardsFor(user?.role);
  const current = user ? dashboards.find((d) => isInDashboard(d, pathname)) : undefined;

  useEffect(() => {
    if (current) rememberDashboard(current.href);
  }, [current]);

  if (!user || dashboards.length < 2) return null;

  return (
    <nav aria-label="Switch dashboard" className="mb-6">
      <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Dashboards
      </p>
      <div className="flex border-3 border-foreground">
        {dashboards.map((dashboard) => {
          const active = dashboard === current;
          return (
            <Link
              key={dashboard.href}
              href={dashboard.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={`flex-1 px-2 py-2 text-center text-xs font-bold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 [&:not(:first-child)]:border-l-3 [&:not(:first-child)]:border-foreground ${
                active ? "bg-primary text-foreground" : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {dashboard.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
