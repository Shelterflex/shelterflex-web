/** Admin view of whistleblower safety reports and suspensions. */

import { apiGet, apiPost } from "../apiClient";

export interface SafetyReportSummary {
  reportId: string;
  listingId: string | null;
  details: string;
  createdAt: string;
}

export interface SafetyCase {
  whistleblowerId: string;
  name: string | null;
  email: string | null;
  suspended: boolean;
  suspendedAt: string | null;
  distinctReporters: number;
  reports: SafetyReportSummary[];
}

export async function listSafetyCases(): Promise<SafetyCase[]> {
  const res = await apiGet<{ data: SafetyCase[] }>("/whistleblower/admin/safety");
  return res.data;
}

export async function suspendWhistleblower(id: string): Promise<void> {
  await apiPost(`/whistleblower/admin/${encodeURIComponent(id)}/suspend`, {}, { maxRetries: 0 });
}

export async function reinstateWhistleblower(id: string): Promise<void> {
  await apiPost(`/whistleblower/admin/${encodeURIComponent(id)}/reinstate`, {}, { maxRetries: 0 });
}
