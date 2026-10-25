import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ apiGet: vi.fn() }));
vi.mock("./apiClient", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./apiClient")>()),
  apiGet: api.apiGet,
}));

import { hasActiveLease } from "./tenantLease";

describe("hasActiveLease", () => {
  beforeEach(() => api.apiGet.mockReset());

  it("asks for the tenant's own deals", async () => {
    api.apiGet.mockResolvedValue({ data: { deals: [] } });
    await hasActiveLease("u1");
    expect(api.apiGet).toHaveBeenCalledWith("/deals?tenantId=u1");
  });

  it("is true for an active or at-risk deal", async () => {
    api.apiGet.mockResolvedValue({
      data: { deals: [{ dealId: "d", status: "at_risk" }] },
    });
    expect(await hasActiveLease("u1")).toBe(true);
  });

  it("is false with no deals, or only draft and finished ones", async () => {
    api.apiGet.mockResolvedValue({
      data: {
        deals: [
          { dealId: "a", status: "draft" },
          { dealId: "b", status: "completed" },
        ],
      },
    });
    expect(await hasActiveLease("u1")).toBe(false);
  });
});
