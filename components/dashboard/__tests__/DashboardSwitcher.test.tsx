import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardSwitcher } from "../DashboardSwitcher";
import { dashboardsFor, homeDashboardFor } from "@/lib/dashboardPath";

vi.mock("@/lib/authApi", () => ({ addRole: vi.fn() }));

const landlordApi = vi.hoisted(() => ({ getSettings: vi.fn() }));
vi.mock("@/lib/landlordApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/landlordApi")>()),
  getSettings: landlordApi.getSettings,
}));

const nav = vi.hoisted(() => ({
  pathname: "/dashboard/tenant",
  push: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: nav.push }),
}));

const current = vi.hoisted(() => ({
  user: null as { role?: string; roles?: string[] } | null,
}));
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({
    user: current.user,
    isAuthenticated: !!current.user,
  }),
}));

function renderAt(pathname: string, role: string | null, roles?: string[]) {
  nav.pathname = pathname;
  current.user = role ? { role, roles } : null;
  return render(<DashboardSwitcher />);
}

describe("DashboardSwitcher", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    landlordApi.getSettings.mockReset();
    landlordApi.getSettings.mockResolvedValue({
      profile: {
        fullName: "A",
        email: "a@b.co",
        companyName: "",
        phone: "1",
        address: "x",
      },
    });
  });

  it("offers only the dashboards the account is registered for", async () => {
    renderAt("/dashboard/tenant/payments", "tenant", ["tenant", "landlord"]);
    await screen.findByRole("link", { name: "Landlord" });
    expect(screen.getByRole("link", { name: "Tenant" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      await screen.findByRole("link", { name: "Landlord" }),
    ).toHaveAttribute("href", "/dashboard/landlord");
    expect(
      screen.queryByRole("link", { name: "Whistleblower" }),
    ).not.toBeInTheDocument();
  });

  it("hides the landlord tab until the landlord has a profile", async () => {
    landlordApi.getSettings.mockResolvedValue({
      profile: {
        fullName: "A",
        email: "a@b.co",
        companyName: "",
        phone: "",
        address: "",
      },
    });
    renderAt("/dashboard/tenant", "tenant", ["tenant", "landlord"]);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Landlord" }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("link", { name: "Landlord" }),
    ).not.toBeInTheDocument();
  });

  it("shows a landlord tab on first paint when the profile is remembered", () => {
    landlordApi.getSettings.mockReturnValue(new Promise(() => {}));
    sessionStorage.setItem("shelterflex-landlord-profile-ready", "u1:true");
    current.user = {
      id: "u1",
      role: "tenant",
      roles: ["tenant", "landlord"],
    } as never;
    nav.pathname = "/dashboard/tenant";
    render(<DashboardSwitcher />);
    expect(screen.getByRole("link", { name: "Landlord" })).toBeInTheDocument();
  });

  it("offers a way to add the roles the account doesn't have", () => {
    renderAt("/dashboard/tenant", "tenant", ["tenant"]);
    expect(
      screen.queryByRole("link", { name: "Tenant" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Landlord" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Whistleblower" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Tenant" }),
    ).not.toBeInTheDocument();
  });

  it("marks the whistleblower dashboard current on its sub-pages", async () => {
    renderAt("/whistleblower/report", "landlord", [
      "landlord",
      "whistleblower",
    ]);
    await screen.findByRole("link", { name: "Landlord" });
    expect(screen.getByRole("link", { name: "Whistleblower" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      await screen.findByRole("link", { name: "Landlord" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("is hidden for a legacy agent account, which only has one dashboard", () => {
    renderAt("/whistleblower/dashboard", "agent");
    expect(
      screen.queryByRole("link", { name: "Whistleblower" }),
    ).not.toBeInTheDocument();
  });

  it("remembers the open dashboard as the user's home dashboard", () => {
    const roles = ["tenant", "whistleblower"];
    expect(homeDashboardFor("tenant", roles)).toBe("/dashboard/tenant");
    renderAt("/whistleblower/dashboard", "tenant", roles);
    expect(homeDashboardFor("tenant", roles)).toBe("/whistleblower/dashboard");
  });
});

describe("homeDashboardFor", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to the dashboard for the role the user signed up with", () => {
    expect(homeDashboardFor("landlord")).toBe("/dashboard/landlord");
  });

  it("ignores a remembered dashboard the user can't use", () => {
    localStorage.setItem("shelterflex-last-dashboard", "/dashboard/landlord");
    expect(homeDashboardFor("tenant", ["tenant"])).toBe("/dashboard/tenant");
  });
});

describe("dashboardsFor", () => {
  it("lists the signup role first, then any added roles", () => {
    expect(
      dashboardsFor("landlord", ["whistleblower"]).map((d) => d.label),
    ).toEqual(["Landlord", "Whistleblower"]);
  });

  it("gives an account with no added roles only its own dashboard", () => {
    expect(dashboardsFor("tenant").map((d) => d.label)).toEqual(["Tenant"]);
  });
});
