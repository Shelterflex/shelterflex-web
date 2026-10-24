import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RoleGuard } from "../RoleGuard";
import { dashboardPathFor } from "@/lib/dashboardPath";

const nav = vi.hoisted(() => ({ pathname: "/dashboard/tenant", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ replace: nav.replace }),
}));

const current = vi.hoisted(() => ({ user: null as { role?: string } | null }));
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: current.user, isAuthenticated: true }),
}));

function renderAt(pathname: string, role: string | null) {
  nav.pathname = pathname;
  current.user = role ? { role } : null;
  return render(
    <RoleGuard>
      <p>dashboard content</p>
    </RoleGuard>,
  );
}

describe("RoleGuard", () => {
  beforeEach(() => nav.replace.mockReset());

  it("sends a tenant who lands on the landlord dashboard back to their own", () => {
    renderAt("/dashboard/landlord", "tenant");
    expect(nav.replace).toHaveBeenCalledWith("/dashboard/tenant");
    expect(screen.queryByText("dashboard content")).not.toBeInTheDocument();
  });

  it("renders a user's own dashboard", () => {
    renderAt("/dashboard/landlord/properties", "landlord");
    expect(nav.replace).not.toHaveBeenCalled();
    expect(screen.getByText("dashboard content")).toBeInTheDocument();
  });

  it("lets anyone open shared dashboard pages and the agent application", () => {
    renderAt("/dashboard/notifications", "tenant");
    renderAt("/dashboard/agent/apply", "tenant");
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("lets admins open any role's dashboard", () => {
    renderAt("/dashboard/tenant", "admin");
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("waits for the user to load before deciding", () => {
    renderAt("/dashboard/landlord", null);
    expect(nav.replace).not.toHaveBeenCalled();
    expect(screen.getByText("dashboard content")).toBeInTheDocument();
  });
});

describe("dashboardPathFor", () => {
  it("maps each role to its dashboard and falls back to the tenant one", () => {
    expect(dashboardPathFor("tenant")).toBe("/dashboard/tenant");
    expect(dashboardPathFor("landlord")).toBe("/dashboard/landlord");
    expect(dashboardPathFor("inspector")).toBe("/dashboard/inspector");
    expect(dashboardPathFor("admin")).toBe("/admin/analytics");
    expect(dashboardPathFor(undefined)).toBe("/dashboard/tenant");
  });
});
