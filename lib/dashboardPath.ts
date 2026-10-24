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
  admin: "/admin/analytics",
};

export function dashboardPathFor(role: string | null | undefined): string {
  return (role && DASHBOARD_BY_ROLE[role]) || DASHBOARD_BY_ROLE.tenant;
}
