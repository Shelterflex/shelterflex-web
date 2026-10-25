/**
 * Automatic bank deduction for a deal. Every deal repays this way; it is set up
 * during onboarding, so the tenant can view it but not turn it off.
 */

import { apiGet, ApiError } from "./apiClient";

export type MandateStatus = "pending" | "active" | "failed" | "cancelled";

export interface RepaymentMandate {
  dealId: string;
  bankName: string;
  accountName: string;
  accountLast4: string;
  /** Day of the month each installment is debited. */
  deductionDay: number;
  status: MandateStatus;
  createdAt: string;
  updatedAt: string;
}

/** Returns the deal's mandate, or null if it hasn't been set up yet. */
export async function getRepaymentMandate(
  dealId: string,
): Promise<RepaymentMandate | null> {
  try {
    const res = await apiGet<{ success: boolean; data: RepaymentMandate }>(
      `/deals/${encodeURIComponent(dealId)}/mandate`,
    );
    return res.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
