/**
 * Where "back to dashboard" goes for each role. Pages shared by every role
 * (messages, notifications) must use this instead of hard-coding one
 * dashboard, which sent tenants to the landlord dashboard and vice versa.
 */
const DASHBOARD_BY_ROLE: Record<string, string> = {
  tenant: "/dashboard/tenant",
  landlord: "/dashboard/landlord",
  // Legacy role: agents were replaced by whistleblowers.
  agent: "/whistleblower/dashboard",
  inspector: "/dashboard/inspector",
  // Whistleblower-only accounts have no tenant dashboard.
  whistleblower: "/whistleblower/dashboard",
  admin: "/admin/analytics",
};

export function dashboardPathFor(role: string | null | undefined): string {
  return (role && DASHBOARD_BY_ROLE[role]) || DASHBOARD_BY_ROLE.tenant;
}

export interface DashboardLink {
  href: string;
  label: string;
  /** Path prefix of the dashboard's pages, used to tell which one is open. */
  section: string;
}

const ROLE_DASHBOARDS: Record<string, DashboardLink> = {
  tenant: { href: "/dashboard/tenant", label: "Tenant", section: "/dashboard/tenant" },
  landlord: { href: "/dashboard/landlord", label: "Landlord", section: "/dashboard/landlord" },
  inspector: { href: "/dashboard/inspector", label: "Inspector", section: "/dashboard/inspector" },
  admin: { href: "/admin/analytics", label: "Admin", section: "/admin" },
};

const WHISTLEBLOWER_DASHBOARD: DashboardLink = {
  href: "/whistleblower/dashboard",
  label: "Whistleblower",
  section: "/whistleblower",
};

/** The roles an account holds: the one it signed up with, plus any it added. */
export function rolesOf(role: string | null | undefined, roles?: readonly string[]): string[] {
  return [...new Set([...(role ? [role] : []), ...(roles ?? [])])];
}

/**
 * The dashboards a user can switch between: one per role the account is
 * registered for. A role the account hasn't added has no dashboard to open.
 */
export function dashboardsFor(
  role: string | null | undefined,
  roles?: readonly string[],
): DashboardLink[] {
  const links: DashboardLink[] = [];
  for (const held of rolesOf(role, roles)) {
    // The legacy agent role opens the whistleblower dashboard.
    const link = held === "whistleblower" || held === "agent" ? WHISTLEBLOWER_DASHBOARD : ROLE_DASHBOARDS[held];
    if (link && !links.includes(link)) links.push(link);
  }
  return links;
}

export function isInDashboard(dashboard: DashboardLink, pathname: string): boolean {
  return pathname === dashboard.section || pathname.startsWith(`${dashboard.section}/`);
}

const LAST_DASHBOARD_KEY = "shelterflex-last-dashboard";

/** Remembers the dashboard the user just opened, so they come back to it. */
export function rememberDashboard(href: string): void {
  try {
    localStorage.setItem(LAST_DASHBOARD_KEY, href);
  } catch {
    // Storage unavailable (private mode): fall back to the role's dashboard.
  }
}

/**
 * Where "Dashboard" and post-login go: the dashboard the user last opened in
 * this browser, or else the one for the role they signed up with, as long
 * as the account is still registered for it.
 */
export function homeDashboardFor(
  role: string | null | undefined,
  roles?: readonly string[],
): string {
  let last: string | null = null;
  try {
    last = localStorage.getItem(LAST_DASHBOARD_KEY);
  } catch {
    // Ignore; use the role's dashboard.
  }
  const allowed = dashboardsFor(role, roles).some((d) => d.href === last);
  return last && allowed ? last : dashboardPathFor(role);
}
