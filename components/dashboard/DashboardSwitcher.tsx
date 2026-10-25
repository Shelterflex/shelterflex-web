"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { addRole } from "@/lib/authApi";
import { getSettings, hasLandlordProfile } from "@/lib/landlordApi";
import {
  dashboardsFor,
  isInDashboard,
  rememberDashboard,
  rolesOf,
} from "@/lib/dashboardPath";

const ADDABLE = [
  { role: "tenant", label: "Tenant", href: "/dashboard/tenant" },
  { role: "landlord", label: "Landlord", href: "/dashboard/landlord" },
  // Whistleblowers apply first; the application adds the role.
  {
    role: "whistleblower",
    label: "Whistleblower",
    href: "/whistleblower/signup",
  },
] as const;

/**
 * Tabs for moving between the dashboards the signed-in user is registered
 * for, one open at a time, plus a way to register for a role they don't have
 * yet. Also remembers the open dashboard so "Dashboard" returns to it.
 */
export function DashboardSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const router = useRouter();
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const held = rolesOf(user?.role, user?.roles);
  const isLandlord = held.includes("landlord");
  // null until checked. A landlord role without a profile isn't a dashboard yet.
  const [landlordReady, setLandlordReady] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLandlord) return;
    let cancelled = false;
    getSettings()
      .then(
        (settings) =>
          !cancelled && setLandlordReady(hasLandlordProfile(settings)),
      )
      .catch(() => !cancelled && setLandlordReady(true));
    return () => {
      cancelled = true;
    };
  }, [isLandlord]);

  const hideLandlord = isLandlord && landlordReady === false;
  const dashboards = dashboardsFor(user?.role, user?.roles).filter(
    (d) => !(hideLandlord && d.section === "/dashboard/landlord"),
  );
  const addable = ADDABLE.filter(
    (a) => !held.includes(a.role) || (a.role === "landlord" && hideLandlord),
  );
  const current = user
    ? dashboards.find((d) => isInDashboard(d, pathname))
    : undefined;

  useEffect(() => {
    if (current) rememberDashboard(current.href);
  }, [current]);

  if (!user || (dashboards.length < 2 && addable.length === 0)) return null;

  async function add(item: (typeof ADDABLE)[number]) {
    if (item.role === "whistleblower") {
      onNavigate?.();
      router.push(item.href);
      return;
    }
    setAdding(item.role);
    setError(null);
    try {
      if (!held.includes(item.role)) await addRole(item.role);
      onNavigate?.();
      router.push(item.href);
    } catch {
      setError(`Couldn't add the ${item.label} dashboard. Try again.`);
    } finally {
      setAdding(null);
    }
  }

  return (
    <nav aria-label="Switch dashboard" className="mb-6">
      <p className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Dashboards
      </p>
      {dashboards.length >= 2 && (
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
                  active
                    ? "bg-primary text-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {dashboard.label}
              </Link>
            );
          })}
        </div>
      )}
      {addable.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Add:</span>
          {addable.map((item) => (
            <button
              key={item.role}
              type="button"
              disabled={adding !== null}
              onClick={() => add(item)}
              className="font-bold underline underline-offset-2 hover:text-foreground disabled:opacity-60"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs font-bold text-destructive">
          {error}
        </p>
      )}
    </nav>
  );
}
