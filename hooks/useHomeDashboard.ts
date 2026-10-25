"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMounted } from "@/hooks/use-mounted";
import { dashboardPathFor, homeDashboardFor } from "@/lib/dashboardPath";

/**
 * The signed-in user's dashboard link: the one they last opened, else their
 * role's. The remembered choice lives in localStorage, so the server render
 * (and the first client render) use the role's dashboard.
 */
export function useHomeDashboard(): string {
  const { user } = useCurrentUser();
  const mounted = useMounted();
  return mounted ? homeDashboardFor(user?.role, user?.roles) : dashboardPathFor(user?.role);
}
