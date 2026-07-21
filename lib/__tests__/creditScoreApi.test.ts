import { afterEach, describe, expect, it, vi } from "vitest";
import { getMyCreditScore, getMyCreditScoreHistory } from "@/lib/creditScoreApi";

const BASE_URL = "http://localhost:4000";

// Only resolves for the exact expected URL; any other URL (the old
// version-relative path, a typo) 404s, so a wrong path in creditScoreApi.ts
// shows up as a distinguishable test failure rather than a false pass.
function mockFetchExact(expectedUrl: string, responseBody: unknown, status = 200) {
  return vi.spyOn(global, "fetch").mockImplementation(async (input) => {
    const requestedUrl = typeof input === "string" ? input : String(input);
    if (requestedUrl !== expectedUrl) {
      return new Response(
        JSON.stringify({ error: { message: `Not Found: ${requestedUrl}` } }),
        { status: 404 },
      );
    }
    return new Response(JSON.stringify(responseBody), { status });
  });
}

describe("creditScoreApi: every call resolves against its mounted unversioned route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("getMyCreditScore hits /api/tenant/credit-score/my, not the old version-relative path", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/credit-score/my`, {
      score: 700,
      band: "Good",
      factors: [],
      computedAt: "2026-07-21T00:00:00.000Z",
      tips: [],
    });
    await expect(getMyCreditScore()).resolves.toMatchObject({ score: 700, band: "Good" });
  });

  it("getMyCreditScoreHistory hits /api/tenant/credit-score/my/history, not the old version-relative path", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/credit-score/my/history`, {
      history: [{ score: 700, band: "Good", computedAt: "2026-07-21T00:00:00.000Z" }],
    });
    await expect(getMyCreditScoreHistory()).resolves.toMatchObject({
      history: [{ score: 700, band: "Good", computedAt: "2026-07-21T00:00:00.000Z" }],
    });
  });
});
