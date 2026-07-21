import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDispute,
  createTenantApplication,
  getMyDisputes,
  getPaymentHistory,
  getPaymentSchedule,
  getTenantApplication,
  getWalletBalance,
  initiateQuickPay,
  initiateWalletTopUp,
  listTenantApplications,
} from "@/lib/tenantApi";

const BASE_URL = "http://localhost:4000";

// Only resolves for the exact expected URL; any other URL (a stale /api/v1
// prefix, a doubled prefix, a typo) 404s, so a wrong path in tenantApi.ts
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

describe("tenantApi: every call resolves against its mounted unversioned route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("getMyDisputes hits /api/tenant/payments/disputes", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/payments/disputes`, { disputes: [] });
    await expect(getMyDisputes()).resolves.toEqual({ disputes: [] });
  });

  it("createDispute posts to /api/tenant/payments/disputes", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/payments/disputes`, {
      success: true,
      disputeId: "d1",
    });
    await expect(
      createDispute({ paymentId: "p1", reason: "other", description: "test" }),
    ).resolves.toEqual({ success: true, disputeId: "d1" });
  });

  it("createTenantApplication posts to /api/tenant/applications", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/applications`, {
      success: true,
      data: { applicationId: "a1" },
    });
    await expect(
      createTenantApplication({
        propertyId: 1,
        annualRent: 100000,
        deposit: 10000,
        duration: 12,
        hasAgreedToTerms: true,
      }),
    ).resolves.toEqual({ success: true, data: { applicationId: "a1" } });
  });

  it("getTenantApplication hits /api/tenant/applications/:id", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/applications/a1`, {
      success: true,
      data: { applicationId: "a1" },
    });
    await expect(getTenantApplication("a1")).resolves.toEqual({
      success: true,
      data: { applicationId: "a1" },
    });
  });

  it("listTenantApplications hits /api/tenant/applications", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/applications`, { success: true, data: [] });
    await expect(listTenantApplications()).resolves.toEqual({ success: true, data: [] });
  });

  it("getPaymentSchedule hits /api/tenant/payments/schedule, not the previously doubled /api/v1 path", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/payments/schedule`, {
      success: true,
      data: { schedule: [], nextPayment: null },
    });
    await expect(getPaymentSchedule()).resolves.toEqual({
      success: true,
      data: { schedule: [], nextPayment: null },
    });
  });

  it("getPaymentHistory hits /api/tenant/payments, not the previously doubled /api/v1 path", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/payments`, {
      success: true,
      data: { payments: [], page: 1, limit: 10, total: 0 },
    });
    await expect(getPaymentHistory()).resolves.toEqual({
      success: true,
      data: { payments: [], page: 1, limit: 10, total: 0 },
    });
  });

  it("getWalletBalance hits /api/tenant/payments/wallet", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/payments/wallet`, {
      success: true,
      data: {
        balance: 0,
        availableNgn: 0,
        heldNgn: 0,
        totalNgn: 0,
        lastTopUp: "",
        autoPayEnabled: false,
      },
    });
    await expect(getWalletBalance()).resolves.toMatchObject({ success: true });
  });

  it("initiateQuickPay posts to /api/tenant/payments/quick-pay", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/payments/quick-pay`, {
      success: true,
      data: { paymentId: "p1", status: "pending", amount: 1000, method: "wallet", message: "ok" },
    });
    await expect(
      initiateQuickPay({ dealId: "d1", amount: 1000, paymentMethod: "wallet" }),
    ).resolves.toMatchObject({ success: true });
  });

  it("initiateWalletTopUp posts to /api/tenant/payments/wallet/topup", async () => {
    mockFetchExact(`${BASE_URL}/api/tenant/payments/wallet/topup`, {
      success: true,
      data: { topUpId: "t1", amount: 1000, status: "pending", reference: "ref1" },
    });
    await expect(
      initiateWalletTopUp({ amount: 1000, paymentMethod: "card" }),
    ).resolves.toMatchObject({ success: true });
  });
});
