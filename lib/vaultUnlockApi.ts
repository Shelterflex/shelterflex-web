/**
 * Step-up verification for the document vault. Opening it needs a recent
 * emailed code on top of being signed in; the API enforces this, and these
 * calls are how the page satisfies it.
 */

import { apiGet, apiPost, apiDelete, ApiError } from "./apiClient";

export interface VaultUnlockStatus {
  unlocked: boolean;
  unlockedUntil: string | null;
}

export async function getVaultUnlockStatus(): Promise<VaultUnlockStatus> {
  const res = await apiGet<{ data: VaultUnlockStatus }>("/tenant/vault/unlock");
  return res.data;
}

export async function requestVaultCode(): Promise<void> {
  await apiPost("/tenant/vault/unlock/request", {});
}

export async function unlockVault(otp: string): Promise<VaultUnlockStatus> {
  const res = await apiPost<{ data: VaultUnlockStatus }>("/tenant/vault/unlock", { otp });
  return res.data;
}

export async function lockVault(): Promise<void> {
  await apiDelete("/tenant/vault/unlock");
}

/** True when the API refused a vault request because the session isn't unlocked. */
export function isVaultLockedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    (error.details as { reason?: string } | undefined)?.reason === "vault_locked"
  );
}
