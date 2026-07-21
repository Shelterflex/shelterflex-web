/**
 * Tenant API Client
 * Handles tenant application and payment operations
 *
 * Path convention (interim, pending shelterflex-api#4): per maintainer
 * confirmation on issue #2, the tenant payments/applications routers are
 * mounted on the backend WITHOUT the /api/v1 prefix. Every call in this file
 * therefore uses apiGetUnversioned/apiPostUnversioned with a literal
 * "/api/..." path, bypassing the version prefix that apiFetch normally
 * applies. Once shelterflex-api#4 lands and these routers move under
 * /api/v1, switch these calls back to apiGet/apiPost with version-relative
 * paths (e.g. "/tenant/payments/disputes").
 */

import { apiGetUnversioned, apiPostUnversioned } from "./apiClient";

// ── Tenant Application Types ────────────────────────────────────────────────

export interface TenantApplication {
  applicationId: string;
  userId: string;
  propertyId: number;
  propertyTitle?: string;
  propertyLocation?: string;
  annualRent: number;
  deposit: number;
  duration: number;
  totalAmount: number;
  monthlyPayment: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  hasAgreedToTerms: boolean;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface CreateApplicationRequest {
  propertyId: number;
  annualRent: number;
  deposit: number;
  duration: number;
  hasAgreedToTerms: boolean;
  propertyTitle?: string;
  propertyLocation?: string;
}

export interface CreateApplicationResponse {
  success: boolean;
  data: TenantApplication;
}

export interface GetApplicationResponse {
  success: boolean;
  data: TenantApplication;
}

export interface ListApplicationsResponse {
  success: boolean;
  data: TenantApplication[];
  nextCursor?: string;
}

// ── Tenant Payment Types ────────────────────────────────────────────────────

export interface TenantDeal {
  dealId: string;
  leaseName: string;
}

export type PaymentStatus = "paid" | "overdue" | "upcoming" | "processing";

export interface PaymentScheduleItem {
  period: number;
  month: string;
  amount: number;
  dueDate: string;
  status: "paid" | "upcoming" | "pending" | "overdue";
  paidDate?: string;
  isNextDue?: boolean;
}

export interface PaymentScheduleResponse {
  success: boolean;
  data: {
    schedule: PaymentScheduleItem[];
    nextPayment: PaymentScheduleItem | null;
    dealId?: string;
    deals?: TenantDeal[];
  };
}

export interface PaymentHistoryItem {
  id: string;
  dealId: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  transactionDate: string;
  paidDate?: string;
  dueDate?: string;
  method: string;
  isOverdue?: boolean;
  daysOverdue?: number;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    payments: PaymentHistoryItem[];
    page: number;
    limit: number;
    total: number;
    nextPage?: number;
    deals?: TenantDeal[];
  };
}

export interface WalletBalanceResponse {
  success: boolean;
  data: {
    balance: number;
    availableNgn: number;
    heldNgn: number;
    totalNgn: number;
    lastTopUp: string;
    autoPayEnabled: boolean;
  };
}

export interface QuickPayRequest {
  dealId: string;
  amount: number;
  paymentMethod: "wallet" | "card";
  idempotencyKey?: string;
}

export interface QuickPayResponse {
  success: boolean;
  data: {
    paymentId: string;
    status: "pending" | "confirmed" | "failed";
    amount: number;
    method: string;
    redirectUrl?: string;
    message: string;
  };
}

export interface WalletTopUpRequest {
  amount: number;
  paymentMethod: "card" | "bank_transfer";
}

export interface WalletTopUpResponse {
  success: boolean;
  data: {
    topUpId: string;
    amount: number;
    status: "pending" | "confirmed" | "failed";
    reference: string;
    redirectUrl?: string | null;
    bankTransfer?: {
      accountNumber: string;
      accountName: string;
      bankName: string;
      reference: string;
    } | null;
    expiresAt?: string | null;
  };
}

export type DisputeReason =
  | "amount_discrepancy"
  | "duplicate_charge"
  | "service_not_received"
  | "early_termination"
  | "property_issue"
  | "other";

export interface PaymentDispute {
  id: string;
  paymentId: string;
  reason: DisputeReason;
  description: string;
  status: "pending" | "under_review" | "resolved" | "rejected";
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeRequest {
  paymentId: string;
  reason: DisputeReason;
  description: string;
  evidenceKeys?: string[];
}

export async function getMyDisputes(): Promise<{ disputes: PaymentDispute[] }> {
  return apiGetUnversioned<{ disputes: PaymentDispute[] }>(
    "/api/tenant/payments/disputes",
  );
}

export async function createDispute(
  data: CreateDisputeRequest,
): Promise<{ success: boolean; disputeId: string }> {
  return apiPostUnversioned<{ success: boolean; disputeId: string }>(
    "/api/tenant/payments/disputes",
    data,
  );
}

// ── Application API Functions ───────────────────────────────────────────────

export async function createTenantApplication(
  data: CreateApplicationRequest,
): Promise<CreateApplicationResponse> {
  return apiPostUnversioned<CreateApplicationResponse>(
    "/api/tenant/applications",
    data,
  );
}

export async function getTenantApplication(
  applicationId: string,
): Promise<GetApplicationResponse> {
  return apiGetUnversioned<GetApplicationResponse>(
    `/api/tenant/applications/${applicationId}`,
  );
}

export async function listTenantApplications(params?: {
  status?: "pending" | "approved" | "rejected" | "cancelled";
  limit?: number;
  cursor?: string;
}): Promise<ListApplicationsResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.cursor) query.set("cursor", params.cursor);

  const path = `/api/tenant/applications${query.toString() ? `?${query.toString()}` : ""}`;
  return apiGetUnversioned<ListApplicationsResponse>(path);
}

// ── Payment API Functions ───────────────────────────────────────────────────

export async function getPaymentSchedule(): Promise<PaymentScheduleResponse> {
  return apiGetUnversioned<PaymentScheduleResponse>(
    "/api/tenant/payments/schedule",
  );
}

export async function getPaymentHistory(params?: {
  limit?: number;
  page?: number;
  dealId?: string;
}): Promise<PaymentHistoryResponse> {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.page) query.set("page", params.page.toString());
  if (params?.dealId) query.set("dealId", params.dealId);

  const path = `/api/tenant/payments${query.toString() ? `?${query.toString()}` : ""}`;
  return apiGetUnversioned<PaymentHistoryResponse>(path);
}

export async function getWalletBalance(): Promise<WalletBalanceResponse> {
  return apiGetUnversioned<WalletBalanceResponse>("/api/tenant/payments/wallet");
}

export async function initiateQuickPay(
  data: QuickPayRequest,
): Promise<QuickPayResponse> {
  return apiPostUnversioned<QuickPayResponse>(
    "/api/tenant/payments/quick-pay",
    data,
  );
}

export async function initiateWalletTopUp(
  data: WalletTopUpRequest,
): Promise<WalletTopUpResponse> {
  return apiPostUnversioned<WalletTopUpResponse>(
    "/api/tenant/payments/wallet/topup",
    data,
  );
}
