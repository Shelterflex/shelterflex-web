import { apiGet, withQuery } from "./apiClient";

interface DealSummary {
  dealId: string;
  status: "draft" | "active" | "at_risk" | "completed" | "defaulted";
}

/**
 * Whether the tenant has a live lease: a financed deal that is running. A
 * tenant still looking for an apartment has none and sees the seeker home.
 */
export async function hasActiveLease(tenantId: string): Promise<boolean> {
  const res = await apiGet<{ data: { deals: DealSummary[] } }>(
    withQuery("/deals", { tenantId }),
  );
  return res.data.deals.some(
    (d) => d.status === "active" || d.status === "at_risk",
  );
}
