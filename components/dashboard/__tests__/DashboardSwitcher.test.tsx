import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardSwitcher } from "../DashboardSwitcher";
import { dashboardsFor, homeDashboardFor } from "@/lib/dashboardPath";

const nav = vi.hoisted(() => ({ pathname: "/dashboard/tenant" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

const current = vi.hoisted(() => ({ user: null as { role?: string } | null }));
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: current.user, isAuthenticated: !!current.user }),
}));

function renderAt(pathname: string, role: string | null) {
  nav.pathname = pathname;
  current.user = role ? { role } : null;
  return render(<DashboardSwitcher />);
}

describe("DashboardSwitcher", () => {
  beforeEach(() => localStorage.clear());

  it("offers a tenant their tenant and whistleblower dashboards", () => {
    renderAt("/dashboard/tenant/payments", "tenant");
    expect(screen.getByRole("link", { name: "Tenant" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Whistleblower" })).toHaveAttribute(
      "href",
      "/whistleblower/dashboard",
    );
    expect(screen.queryByRole("link", { name: "Landlord" })).not.toBeInTheDocument();
  });

  it("marks the whistleblower dashboard current on its sub-pages", () => {
    renderAt("/whistleblower/report", "landlord");
    expect(screen.getByRole("link", { name: "Whistleblower" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Landlord" })).not.toHaveAttribute("aria-current");
  });

  it("is hidden for a legacy agent account, which only has one dashboard", () => {
    renderAt("/whistleblower/dashboard", "agent");
    expect(screen.queryByRole("navigation", { name: "Switch dashboard" })).not.toBeInTheDocument();
  });

  it("remembers the open dashboard as the user's home dashboard", () => {
    expect(homeDashboardFor("tenant")).toBe("/dashboard/tenant");
    renderAt("/whistleblower/dashboard", "tenant");
    expect(homeDashboardFor("tenant")).toBe("/whistleblower/dashboard");
  });
});

describe("homeDashboardFor", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to the dashboard for the role the user signed up with", () => {
    expect(homeDashboardFor("landlord")).toBe("/dashboard/landlord");
  });

  it("ignores a remembered dashboard the user can't use", () => {
    localStorage.setItem("shelterflex-last-dashboard", "/dashboard/landlord");
    expect(homeDashboardFor("tenant")).toBe("/dashboard/tenant");
  });
});

describe("dashboardsFor", () => {
  it("lists the role's dashboard first, then whistleblower", () => {
    expect(dashboardsFor("landlord").map((d) => d.label)).toEqual(["Landlord", "Whistleblower"]);
  });
});
