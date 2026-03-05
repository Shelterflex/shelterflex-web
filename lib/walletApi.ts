import { apiFetch } from "./api";

export interface NgnBalanceResponse {
  availableNgn: number;
  heldNgn: number;
  totalNgn: number;
}

export type WalletLedgerStatus = "pending" | "confirmed" | "failed";

export interface WalletLedgerEntry {
  id: string;
  type: string;
  amountNgn: number;
  status: WalletLedgerStatus;
  timestamp: string;
  reference?: string | null;
}

export interface WalletLedgerResponse {
  entries: WalletLedgerEntry[];
  nextCursor?: string | null;
}

export function getNgnBalance(): Promise<NgnBalanceResponse> {
  return apiFetch<NgnBalanceResponse>("/api/wallet/ngn/balance");
}

export function getNgnLedger(params?: {
  cursor?: string;
  limit?: number;
}): Promise<WalletLedgerResponse> {
  const cursor = params?.cursor ?? "";
  const limit = params?.limit ?? 20;

  const qs = new URLSearchParams();
  if (cursor) qs.set("cursor", cursor);
  qs.set("limit", String(limit));

  return apiFetch<WalletLedgerResponse>(`/api/wallet/ngn/ledger?${qs.toString()}`);
}
