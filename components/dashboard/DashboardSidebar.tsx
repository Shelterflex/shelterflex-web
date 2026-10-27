"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DashboardSwitcher } from "@/components/dashboard/DashboardSwitcher";
import { LogoutButton } from "@/components/logout-button";
import {
  Home,
  Building2,
  CreditCard,
  MessageSquare,
  Settings,
  FileText,
  ShieldCheck,
  Gauge,
  DollarSign,
  Users,
  Plus,
  CalendarCheck,
  Menu,
  Bell,
} from "lucide-react";
import { tapHaptic } from "@/lib/haptics";
import { useNotificationUnread } from "@/hooks/use-notification-unread";

type Role = "tenant" | "landlord" | "inspector" | "whistleblower";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  footer?: boolean;
}

export interface UserInfo {
  /** Overrides the logged-in user's name; normally left unset. */
  name?: string;
  roleLabel: string;
  extra?: React.ReactNode;
}

interface DashboardSidebarProps {
  role: Role;
  userInfo: UserInfo;
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  tenant: [
    { href: "/dashboard/tenant", label: "Dashboard", icon: Home },
    { href: "/dashboard/tenant/payments", label: "Payments", icon: CreditCard },
    {
      href: "/dashboard/tenant/credit-score",
      label: "Credit Score",
      icon: Gauge,
    },
    { href: "/dashboard/tenant/lease", label: "My Lease", icon: FileText },
    {
      href: "/dashboard/tenant/vault",
      label: "Document Vault",
      icon: ShieldCheck,
    },
    { href: "/viewings", label: "Viewings", icon: CalendarCheck },
    {
      href: "/dashboard/tenant/rate-whistleblower",
      label: "Rate Whistleblower",
      icon: MessageSquare,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageSquare,
      badge: (
        <span className="ml-auto flex h-6 w-6 items-center justify-center border-2 border-foreground bg-destructive text-xs font-bold text-destructive-foreground">
          2
        </span>
      ),
    },
    { href: "/dashboard/tenant/settings", label: "Settings", icon: Settings },
  ],
  landlord: [
    { href: "/dashboard/landlord", label: "Dashboard", icon: Home },
    {
      href: "/dashboard/landlord/properties",
      label: "My Properties",
      icon: Building2,
    },
    { href: "/dashboard/landlord/tenants", label: "My Tenants", icon: Users },
    {
      href: "/dashboard/landlord/payouts",
      label: "Payout Schedule",
      icon: DollarSign,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageSquare,
      badge: (
        <span className="ml-auto flex h-6 w-6 items-center justify-center border-2 border-foreground bg-destructive text-xs font-bold text-destructive-foreground">
          3
        </span>
      ),
    },
    { href: "/dashboard/landlord/settings", label: "Settings", icon: Settings },
  ],
  inspector: [
    { href: "/dashboard/inspector", label: "Job Board", icon: Building2 },
    {
      href: "/dashboard/inspector/earnings",
      label: "Earnings",
      icon: DollarSign,
    },
    { href: "/viewings", label: "Viewings", icon: CalendarCheck },
    { href: "/", label: "Back to Home", icon: Home, footer: true },
  ],
  whistleblower: [
    { href: "/whistleblower/dashboard", label: "Dashboard", icon: Home },
    { href: "/whistleblower/report", label: "Report Apartment", icon: Plus },
    { href: "/whistleblower/earnings", label: "Earnings", icon: DollarSign },
    { href: "/viewings", label: "Viewings", icon: CalendarCheck },
  ],
};

// The four-or-fewer destinations people use most, pinned to the bottom of the
// screen on phones. Everything else stays behind "More" (the drawer).
const TAB_ITEMS: Record<Role, Array<{ href: string; label: string; icon: NavItem["icon"] }>> = {
  tenant: [
    { href: "/dashboard/tenant", label: "Home", icon: Home },
    { href: "/dashboard/tenant/payments", label: "Pay", icon: CreditCard },
    { href: "/dashboard/tenant/credit-score", label: "Score", icon: Gauge },
    { href: "/viewings", label: "Viewings", icon: CalendarCheck },
  ],
  landlord: [
    { href: "/dashboard/landlord", label: "Home", icon: Home },
    { href: "/dashboard/landlord/properties", label: "Props", icon: Building2 },
    { href: "/dashboard/landlord/tenants", label: "Tenants", icon: Users },
    { href: "/dashboard/landlord/payouts", label: "Payouts", icon: DollarSign },
  ],
  inspector: [
    { href: "/dashboard/inspector", label: "Jobs", icon: Building2 },
    { href: "/dashboard/inspector/earnings", label: "Earnings", icon: DollarSign },
    { href: "/viewings", label: "Viewings", icon: CalendarCheck },
  ],
  whistleblower: [
    { href: "/whistleblower/dashboard", label: "Home", icon: Home },
    { href: "/whistleblower/report", label: "Report", icon: Plus },
    { href: "/whistleblower/earnings", label: "Earnings", icon: DollarSign },
    { href: "/viewings", label: "Viewings", icon: CalendarCheck },
  ],
};

const ROLE_CONFIG: Record<Role, { cardBg: string; cardLabel: string }> = {
  tenant: { cardBg: "bg-secondary", cardLabel: "Logged in as" },
  landlord: { cardBg: "bg-accent", cardLabel: "Logged in as" },
  inspector: { cardBg: "bg-accent", cardLabel: "Logged in as" },
  whistleblower: { cardBg: "bg-secondary", cardLabel: "Whistleblower" },
};

// These root paths only highlight when matched exactly, not on sub-paths.
const EXACT_MATCH_PATHS = [
  "/dashboard/tenant",
  "/dashboard/landlord",
  "/dashboard/inspector",
  "/whistleblower/dashboard",
  "/",
  "/properties",
  "/messages",
  "/viewings",
];

function isNavItemActive(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  if (EXACT_MATCH_PATHS.includes(href)) return false;
  return pathname.startsWith(href + "/");
}

export function DashboardSidebar({ role, userInfo }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { unread } = useNotificationUnread();
  const unreadLabel = unread > 9 ? "9+" : String(unread);
  const displayName = userInfo.name ?? user?.name;
  const { cardBg, cardLabel } = ROLE_CONFIG[role];
  const isInspector = role === "inspector";

  const mainItems = NAV_ITEMS[role].filter((item) => !item.footer);
  const footerItems = NAV_ITEMS[role].filter((item) => item.footer);

  useEffect(() => {
    if (!open) return;

    const sidebar = sidebarRef.current;
    const focusable = sidebar?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable?.[0];
    const last = focusable?.[focusable.length - 1];
    first?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function closeSidebar() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function navLinkClass(href: string): string {
    const active = isNavItemActive(href, pathname);
    if (isInspector) {
      return active
        ? "flex items-center gap-3 rounded-lg border-2 border-foreground bg-primary px-4 py-3 font-bold text-foreground shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        : "flex items-center gap-3 rounded-lg border-2 border-transparent px-4 py-3 text-muted-foreground outline-none transition-colors hover:border-foreground hover:bg-muted focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
    }
    return active
      ? "flex items-center gap-3 border-3 border-foreground bg-primary p-3 font-bold outline-none shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      : "flex items-center gap-3 border-3 border-foreground bg-card p-3 font-bold outline-none transition-all hover:bg-muted hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
  }

  return (
    <>
      {/* Mobile bottom tab bar; "More" opens the full navigation drawer */}
      <nav
        data-bottom-nav
        aria-label={`${userInfo.roleLabel} quick navigation`}
        className="fixed inset-x-0 bottom-0 z-30 border-t-3 border-foreground bg-card pb-safe lg:hidden"
      >
        <ul className="flex">
          {TAB_ITEMS[role].map(({ href, label, icon: Icon }) => {
            const active = isNavItemActive(href, pathname);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  onClick={tapHaptic}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-16 flex-col items-center justify-center gap-1 font-mono text-[11px] font-bold uppercase ${
                    active ? "bg-primary text-foreground" : "text-foreground/70"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              ref={triggerRef}
              type="button"
              aria-label={
                open ? "Close dashboard navigation" : "Open dashboard navigation"
              }
              aria-expanded={open}
              aria-controls="dashboard-sidebar"
              onClick={() => {
                tapHaptic();
                setOpen(!open);
              }}
              className="flex h-16 w-full flex-col items-center justify-center gap-1 font-mono text-[11px] font-bold uppercase text-foreground/70"
            >
              <span className="relative">
                <Menu className="h-5 w-5" />
                {unread > 0 && (
                  <span
                    aria-label={`${unread} unread notifications`}
                    className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
                  >
                    {unreadLabel}
                  </span>
                )}
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        ref={sidebarRef}
        aria-label={`${userInfo.roleLabel} dashboard navigation`}
        className={`fixed left-0 rtl:right-0 rtl:left-auto top-0 z-40 h-dvh w-64 border-r-3 rtl:border-r-0 rtl:border-l-3 border-foreground bg-card pt-20 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"}`}
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 py-6 pb-safe">
          {/* User card */}
          <div
            className={`mb-6 border-3 border-foreground ${cardBg} p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]`}
          >
            <p className="text-sm font-medium text-foreground">{cardLabel}</p>
            {displayName ? (
              <p className="text-lg font-bold text-foreground">{displayName}</p>
            ) : (
              <span
                aria-hidden="true"
                className="my-1 block h-5 w-32 animate-pulse bg-foreground/15"
              />
            )}
            {userInfo.extra ?? (
              <p className="text-sm text-muted-foreground">
                {userInfo.roleLabel}
              </p>
            )}
          </div>

          <DashboardSwitcher onNavigate={closeSidebar} />

          {/* Nav */}
          <nav className="flex-1 space-y-2">
            {/* The header bell is desktop-only, so phones reach alerts here. */}
            <Link
              href="/dashboard/notifications"
              className={navLinkClass("/dashboard/notifications")}
              aria-current={
                isNavItemActive("/dashboard/notifications", pathname) ? "page" : undefined
              }
              onClick={closeSidebar}
            >
              <Bell className="h-5 w-5" />
              Notifications
              {unread > 0 && (
                <span className="ml-auto flex h-6 min-w-6 items-center justify-center border-2 border-foreground bg-destructive px-1 text-xs font-bold text-destructive-foreground">
                  {unreadLabel}
                </span>
              )}
            </Link>
            {mainItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(item.href)}
                  aria-current={
                    isNavItemActive(item.href, pathname) ? "page" : undefined
                  }
                  onClick={closeSidebar}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {item.badge}
                </Link>
              );
            })}
          </nav>

          {/* Footer items (e.g. inspector's "Back to Home"), then log out */}
          <div className="mt-auto space-y-2 pt-6">
            {footerItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(item.href)}
                  aria-current={
                    isNavItemActive(item.href, pathname) ? "page" : undefined
                  }
                  onClick={closeSidebar}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            <LogoutButton
              onLogout={closeSidebar}
              className={`${navLinkClass("")} w-full`}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
