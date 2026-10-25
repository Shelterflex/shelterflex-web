import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Header } from "./header";

const replace = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ replace }) }));
vi.mock("@/components/layout/NotificationBell", () => ({ NotificationBell: () => null }));
vi.mock("@/components/GlobalSearch", () => ({ GlobalSearch: () => null }));
vi.mock("@/components/header-utilities-menu", () => ({ HeaderUtilitiesMenu: () => null }));
vi.mock("@/hooks/use-mounted", () => ({ useMounted: () => true }));

const current = vi.hoisted(() => ({ user: null as { role?: string; roles?: string[] } | null }));
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: current.user, isAuthenticated: !!current.user }),
}));

describe("Header", () => {
  beforeEach(() => localStorage.clear());

  it("offers Get Started when signed out", () => {
    current.user = null;
    render(<Header />);
    expect(screen.getByRole("link", { name: "Get Started" })).toHaveAttribute("href", "/signup");
    expect(screen.queryByText("My Dashboard")).not.toBeInTheDocument();
  });

  it("links a signed-in user to their dashboard instead", () => {
    current.user = { role: "landlord" };
    render(<Header />);
    expect(screen.getByRole("link", { name: "My Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard/landlord",
    );
    expect(screen.queryByText("Get Started")).not.toBeInTheDocument();
  });

  it("offers log out only when signed in, and clears the session", () => {
    current.user = null;
    const { unmount } = render(<Header />);
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
    unmount();

    localStorage.setItem("shelterflex_token", "t");
    current.user = { role: "tenant" };
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(localStorage.getItem("shelterflex_token")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("returns to the dashboard the user last opened", () => {
    localStorage.setItem("shelterflex-last-dashboard", "/whistleblower/dashboard");
    current.user = { role: "tenant", roles: ["tenant", "whistleblower"] };
    render(<Header />);
    expect(screen.getByRole("link", { name: "My Dashboard" })).toHaveAttribute(
      "href",
      "/whistleblower/dashboard",
    );
  });
});
