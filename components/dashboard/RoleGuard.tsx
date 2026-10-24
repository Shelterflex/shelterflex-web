"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { dashboardPathFor } from "@/lib/dashboardPath";

const ROLE_DASHBOARDS = new Set(["tenant", "landlord", "inspector"]);

/**
 * Keeps each role in its own dashboard: opening /dashboard/<role>/... with a
 * different role redirects to the user's own dashboard instead of rendering
 * someone else's. Admins may open any of them. The API enforces access to the
 * data either way; this stops the UI showing a dashboard that isn't yours.
 */
export function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();

  const section = pathname.split("/")[2] ?? "";
  const role = user?.role;
  const isForeignDashboard =
    !!role &&
    role !== "admin" &&
    ROLE_DASHBOARDS.has(section) &&
    section !== role;

  useEffect(() => {
    if (isForeignDashboard) router.replace(dashboardPathFor(role));
  }, [isForeignDashboard, role, router]);

  if (isForeignDashboard) return null;
  return <>{children}</>;
}
