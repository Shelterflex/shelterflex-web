/**
 * Lease Agreement API Client
 */

import { apiGet, apiPost } from "./apiClient";

export interface LeaseAgreement {
  leaseId: string;
  dealId: string;
  documentKey: string;
  status:
    | "draft"
    | "pending_tenant_signature"
    | "pending_landlord_signature"
    | "fully_signed"
    | "voided";
  tenantSignedAt?: string;
  landlordSignedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SigningUrlResponse {
  url: string;
  expiresAt: string;
  signerRole: "tenant" | "landlord";
}

export async function generateLease(
  dealId: string,
): Promise<{ success: boolean; data: { leaseId: string; documentKey: string; status: string } }> {
  return apiPost(`/api/deals/${dealId}/lease/generate`, {});
}

export async function sendLeaseForSigning(
  dealId: string,
): Promise<{ success: boolean; data: { message: string } }> {
  return apiPost(`/api/deals/${dealId}/lease/send`, {});
}

export async function getLeaseSignUrl(
  dealId: string,
): Promise<{ success: boolean; data: SigningUrlResponse }> {
  return apiGet(`/api/deals/${dealId}/lease/sign-url`);
}

export async function getLease(
  dealId: string,
): Promise<{ success: boolean; data: LeaseAgreement }> {
  return apiGet(`/api/deals/${dealId}/lease`);
}

export async function voidLease(
  dealId: string,
): Promise<{ success: boolean; data: { message: string } }> {
  return apiPost(`/api/deals/${dealId}/lease/void`, {});
}
