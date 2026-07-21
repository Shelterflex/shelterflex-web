/**
 * Credit Score API Client
 *
 * Path convention (interim, pending shelterflex-api#4): per maintainer
 * confirmation on issue #2, the credit-score router is mounted on the
 * backend WITHOUT the /api/v1 prefix. Both calls below use
 * apiGetUnversioned with a literal "/api/..." path, bypassing the version
 * prefix that apiFetch normally applies. Once shelterflex-api#4 lands and
 * this router moves under /api/v1, switch these calls back to apiGet with
 * version-relative paths (e.g. "/tenant/credit-score/my").
 */

import { apiGetUnversioned } from "./apiClient";

export type ScoreBand = "Poor" | "Fair" | "Good" | "Excellent";

export type ScoreFactorStatus = "pass" | "fail" | "warn";

export interface ScoreFactor {
  name: string;
  status: ScoreFactorStatus;
  weight: number;
  detail: string;
}

export interface CreditScoreSnapshot {
  score: number;
  band: ScoreBand;
  factors: ScoreFactor[];
  computedAt: string;
  tips: string[];
}

export interface ScoreHistoryPoint {
  month: string;
  score: number;
}

export interface CreditScoreHistoryResponse {
  history: {
    score: number;
    band: ScoreBand;
    computedAt: string;
  }[];
}

export async function getMyCreditScore(): Promise<CreditScoreSnapshot> {
  return apiGetUnversioned<CreditScoreSnapshot>("/api/tenant/credit-score/my");
}

export async function getMyCreditScoreHistory(): Promise<CreditScoreHistoryResponse> {
  return apiGetUnversioned<CreditScoreHistoryResponse>(
    "/api/tenant/credit-score/my/history",
  );
}
