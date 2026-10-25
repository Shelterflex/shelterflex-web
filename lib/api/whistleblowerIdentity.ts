/**
 * Whistleblower identity verification and safety reports.
 *
 * Reporters prove who they are with a live selfie matched to their ID, so each
 * one is a real, identifiable person; anyone can report a reporter who made
 * them feel unsafe.
 */

import { apiFetch } from "../api";
import { apiPost } from "../apiClient";

export interface WhistleblowerIdentityStatus {
  verified: boolean;
  verifiedAt: string | null;
  suspended: boolean;
}

export function getIdentityStatus(): Promise<WhistleblowerIdentityStatus> {
  return apiFetch<WhistleblowerIdentityStatus>("/whistleblower/identity");
}

export async function verifyIdentity(input: {
  selfie: Blob;
  nin: string;
}): Promise<void> {
  const form = new FormData();
  // Text fields first so the server has them before the file.
  form.append("nin", input.nin);
  form.append("consent", "true");
  form.append("selfie", input.selfie, "selfie.jpg");
  await apiFetch<{ verified: boolean }>("/whistleblower/identity/verify", {
    method: "POST",
    body: form,
  });
}

export async function submitSafetyReport(input: {
  listingId: string;
  details: string;
}): Promise<void> {
  await apiPost("/whistleblower/safety-reports", input, { maxRetries: 0 });
}
