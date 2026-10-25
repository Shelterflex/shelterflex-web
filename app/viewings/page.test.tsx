import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ViewingsPage from "./page";
import type { Viewing } from "@/lib/viewingsApi";

vi.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const api = vi.hoisted(() => ({
  listMyViewings: vi.fn(),
  listViewingsNeedingInspector: vi.fn(),
  respondToViewing: vi.fn(),
  claimViewing: vi.fn(),
  cancelViewing: vi.fn(),
  role: "tenant" as string,
}));
vi.mock("@/lib/viewingsApi", () => api);
vi.mock("@/hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: { role: api.role }, isAuthenticated: true }),
}));

const base: Viewing = {
  viewingId: "v1",
  listingId: "L1",
  startsAt: "2030-01-03T10:00:00.000Z",
  status: "requested",
  role: "tenant",
  requiresInspector: true,
  inspectorAssigned: false,
  place: "Lekki, Lagos",
  address: null,
  tenantFirstName: "Ngozi",
  reporterFirstName: "Ayo",
};

describe("ViewingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.role = "tenant";
    api.listMyViewings.mockResolvedValue([base]);
    api.listViewingsNeedingInspector.mockResolvedValue([]);
  });

  it("shows the place, not the exact address, until a viewing is confirmed", async () => {
    render(<ViewingsPage />);
    expect(await screen.findByText("Waiting for a reply")).toBeInTheDocument();
    expect(screen.getByText("Lekki, Lagos")).toBeInTheDocument();
    expect(screen.getByText(/inspector will attend once one is assigned/i)).toBeInTheDocument();
  });

  it("shows the address once confirmed", async () => {
    api.listMyViewings.mockResolvedValue([{ ...base, status: "confirmed", address: "15 Admiralty Way" }]);
    render(<ViewingsPage />);
    expect(await screen.findByText("15 Admiralty Way")).toBeInTheDocument();
  });

  it("lets the reporter accept or decline a request", async () => {
    api.listMyViewings.mockResolvedValue([{ ...base, role: "reporter" }]);
    api.respondToViewing.mockResolvedValue(base);
    render(<ViewingsPage />);

    await userEvent.click(await screen.findByRole("button", { name: "Accept" }));
    await waitFor(() => expect(api.respondToViewing).toHaveBeenCalledWith("v1", "accept"));
    expect(screen.getByRole("button", { name: "Decline" })).toBeInTheDocument();
  });

  it("lets a tenant cancel an open viewing", async () => {
    api.cancelViewing.mockResolvedValue(base);
    render(<ViewingsPage />);
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(api.cancelViewing).toHaveBeenCalledWith("v1"));
  });

  it("gives inspectors a list of viewings to take", async () => {
    api.role = "inspector";
    api.listMyViewings.mockResolvedValue([]);
    api.listViewingsNeedingInspector.mockResolvedValue([
      { ...base, status: "awaiting_inspector", address: "15 Admiralty Way" },
    ]);
    api.claimViewing.mockResolvedValue(base);
    render(<ViewingsPage />);

    expect(await screen.findByText("Needs an inspector")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /I.ll attend/ }));
    await waitFor(() => expect(api.claimViewing).toHaveBeenCalledWith("v1"));
  });

  it("does not offer inspector tools to everyone else", async () => {
    render(<ViewingsPage />);
    await screen.findByText("Your viewings");
    expect(screen.queryByText("Needs an inspector")).not.toBeInTheDocument();
    expect(api.listViewingsNeedingInspector).not.toHaveBeenCalled();
  });
});
