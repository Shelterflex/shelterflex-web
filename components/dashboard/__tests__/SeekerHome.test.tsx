import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SeekerHome } from "../SeekerHome";

const api = vi.hoisted(() => ({ listMyViewings: vi.fn() }));
vi.mock("@/lib/viewingsApi", () => ({ listMyViewings: api.listMyViewings }));

describe("SeekerHome", () => {
  beforeEach(() => api.listMyViewings.mockReset().mockResolvedValue([]));

  it("starts the profile for a new tenant and shows no lease details", async () => {
    render(
      <SeekerHome onboarding={{ completedSteps: [], submitted: false }} />,
    );
    expect(
      screen.getByRole("link", { name: /Start your profile/ }),
    ).toHaveAttribute("href", "/onboarding");
    expect(await screen.findByText(/No viewings booked/)).toBeInTheDocument();
    expect(screen.queryByText(/next payment/i)).not.toBeInTheDocument();
  });

  it("shows the review message once the profile is submitted", () => {
    render(
      <SeekerHome onboarding={{ completedSteps: ["a"], submitted: true }} />,
    );
    expect(screen.getByText(/Profile submitted/)).toBeInTheDocument();
  });

  it("lists only upcoming viewings the tenant requested", async () => {
    const soon = new Date(Date.now() + 86_400_000).toISOString();
    const base = {
      listingId: "l",
      requiresInspector: false,
      inspectorAssigned: false,
      address: null,
      tenantFirstName: "A",
      reporterFirstName: "B",
    };
    api.listMyViewings.mockResolvedValue([
      {
        ...base,
        viewingId: "1",
        startsAt: soon,
        status: "confirmed",
        role: "tenant",
        place: "Yaba, Lagos",
      },
      {
        ...base,
        viewingId: "2",
        startsAt: soon,
        status: "declined",
        role: "tenant",
        place: "Ikeja, Lagos",
      },
      {
        ...base,
        viewingId: "3",
        startsAt: soon,
        status: "confirmed",
        role: "reporter",
        place: "Lekki, Lagos",
      },
    ]);
    render(<SeekerHome onboarding={null} />);
    expect(await screen.findByText("Yaba, Lagos")).toBeInTheDocument();
    expect(screen.queryByText("Ikeja, Lagos")).not.toBeInTheDocument();
    expect(screen.queryByText("Lekki, Lagos")).not.toBeInTheDocument();
  });
});
