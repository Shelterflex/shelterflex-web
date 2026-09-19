/**
 * Public platform-stats API client.
 *
 * This endpoint is unauthenticated — it exposes aggregate counters for the
 * marketing pages (homepage, landlords). It does NOT go through the shared
 * apiFetch / apiGet helpers because those attach auth headers and assume a
 * logged-in session; this endpoint must be callable without any token.
 *
 * Backend issue: Shelterflex/shelterflex-api#26
 */

import { getServerBackendUrl, getClientBackendUrl } from "./config/env";

// ── Response shape (mirrors shelterflex-api#26) ───────────────────────────────

export interface PlatformStats {
  /** Total tenants who have ever transacted on the platform */
  totalTenants: number;
  /** Total NGN value of rent financed, in kobo (divide by 100 for naira) */
  totalRentFinancedKobo: number;
  /** Total landlords who have ever listed a property */
  totalLandlords: number;
  /** Total active property listings */
  totalProperties: number;
  /** Number of cities / metro areas with at least one active listing */
  citiesCovered: number;
  /** Average payout time in hours (landlord side) */
  avgPayoutHours: number;
  /** Historical landlord default rate as a decimal (0.00 = 0 %) */
  landlordDefaultRate: number;
}

export interface PlatformStatsResponse {
  success: boolean;
  data: PlatformStats;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format a naira amount from kobo, e.g. 5_000_000_00 → "₦5B+" */
export function formatRentFinanced(kobo: number): string {
  const naira = kobo / 100;
  if (naira >= 1_000_000_000) {
    const bn = naira / 1_000_000_000;
    return `₦${bn % 1 === 0 ? bn : bn.toFixed(1)}B+`;
  }
  if (naira >= 1_000_000) {
    const mn = naira / 1_000_000;
    return `₦${mn % 1 === 0 ? mn : mn.toFixed(0)}M+`;
  }
  return `₦${naira.toLocaleString("en-NG")}`;
}

/** Format a plain integer with a "+" suffix, e.g. 10432 → "10,000+" */
export function formatCount(n: number): string {
  if (n === 0) return "0";
  // Round down to nearest significant figure for a "10,000+" style label
  const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
  const rounded = Math.floor(n / magnitude) * magnitude;
  return `${rounded.toLocaleString("en-NG")}+`;
}

/** Format the landlord default rate as a percentage string, e.g. 0 → "0%" */
export function formatDefaultRate(rate: number): string {
  if (rate === 0) return "0%";
  const pct = rate * 100;
  return `${pct < 1 ? pct.toFixed(1) : Math.round(pct)}%`;
}

/** Format average payout hours, e.g. 48 → "48hrs" */
export function formatPayoutHours(hours: number): string {
  if (hours < 24) return `${hours}hrs`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Fetch platform stats from the backend.
 *
 * Safe to call from both server components (SSR/ISR) and client components.
 * Returns `null` on any network or parse failure — callers must handle the
 * null case gracefully (hide stat row or show neutral state).
 *
 * @param serverSide - Pass `true` when calling from a Server Component so the
 *   server-side base URL is used instead of the client runtime config.
 */
export async function fetchPlatformStats(
  serverSide = false,
): Promise<PlatformStats | null> {
  try {
    const base = serverSide ? getServerBackendUrl() : getClientBackendUrl();
    const url = `${base}/api/v1/platform-stats`;

    const res = await fetch(url, {
      // Revalidate at most every 5 minutes in Next.js ISR cache
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as PlatformStatsResponse;
    if (!json.success || !json.data) return null;

    return json.data;
  } catch {
    return null;
  }
}
