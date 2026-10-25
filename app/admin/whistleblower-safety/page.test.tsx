import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WhistleblowerSafetyPage from "./page";

vi.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const api = vi.hoisted(() => ({
  listSafetyCases: vi.fn(),
  suspendWhistleblower: vi.fn(),
  reinstateWhistleblower: vi.fn(),
}));
vi.mock("@/lib/api/whistleblowerSafetyAdmin", () => api);

const suspended = {
  whistleblowerId: "wb-1",
  name: "Ayo Reporter",
  email: "ayo@example.com",
  suspended: true,
  suspendedAt: "2026-10-01T10:00:00.000Z",
  distinctReporters: 3,
  reports: [{ reportId: "r1", listingId: "L1", details: "Asked me to come alone at night", createdAt: "2026-09-30T10:00:00.000Z" }],
};
const watching = {
  whistleblowerId: "wb-2",
  name: "Chi Reporter",
  email: "chi@example.com",
  suspended: false,
  suspendedAt: null,
  distinctReporters: 1,
  reports: [{ reportId: "r2", listingId: null, details: "Seemed off", createdAt: "2026-09-29T10:00:00.000Z" }],
};

describe("WhistleblowerSafetyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.listSafetyCases.mockResolvedValue([suspended, watching]);
  });

  it("shows suspended whistleblowers first, with the reports behind them", async () => {
    render(<WhistleblowerSafetyPage />);
    expect(await screen.findByText("Ayo Reporter")).toBeInTheDocument();
    expect(screen.getByText("Asked me to come alone at night")).toBeInTheDocument();
    expect(screen.queryByText("Chi Reporter")).not.toBeInTheDocument();
  });

  it("can switch to reported-but-not-suspended and suspend early", async () => {
    api.suspendWhistleblower.mockResolvedValue(undefined);
    render(<WhistleblowerSafetyPage />);
    await screen.findByText("Ayo Reporter");

    await userEvent.click(screen.getByRole("button", { name: "Reported, not suspended" }));
    expect(screen.getByText("Chi Reporter")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Suspend now" }));
    await waitFor(() => expect(api.suspendWhistleblower).toHaveBeenCalledWith("wb-2"));
  });

  it("reinstates after confirmation", async () => {
    api.reinstateWhistleblower.mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<WhistleblowerSafetyPage />);
    await userEvent.click(await screen.findByRole("button", { name: "Reinstate" }));
    await waitFor(() => expect(api.reinstateWhistleblower).toHaveBeenCalledWith("wb-1"));
  });

  it("does not reinstate when the admin cancels", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<WhistleblowerSafetyPage />);
    await userEvent.click(await screen.findByRole("button", { name: "Reinstate" }));
    expect(api.reinstateWhistleblower).not.toHaveBeenCalled();
  });
});
