/**
 * Apartment Reviews API Client
 *
 * Thin functions over apiFetch, typed against the backend's real schema in
 * shelterflex-api/src/routes/apartmentReviews.ts. Paths are version-relative
 * (apiFetch prepends /api/v1).
 */

import { apiFetch } from "./api";

// ── Types (mirroring shelterflex-api/src/models/apartmentReview.ts) ──────────

export interface ApartmentReview {
  id: string;
  apartmentId: string;
  userId: string;
  userName?: string;
  rating: number;
  content: string;
  verifiedStay: boolean;
  isHidden: boolean;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApartmentReviewInput {
  apartmentId: string;
  rating: number;
  content: string;
  verifiedStay?: boolean;
}

export interface ApartmentReviewFilters {
  apartmentId?: string;
  rating?: number;
  verifiedStay?: boolean;
  sortBy?: "newest" | "oldest" | "rating_desc" | "rating_asc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedApartmentReviews {
  reviews: ApartmentReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── API functions ────────────────────────────────────────────────────────────

/**
 * List reviews for an apartment, with optional filters.
 * GET /api/v1/apartment-reviews
 */
export async function listApartmentReviews(
  filters: ApartmentReviewFilters = {},
): Promise<PaginatedApartmentReviews> {
  const params = new URLSearchParams();
  if (filters.apartmentId) params.set("apartmentId", filters.apartmentId);
  if (filters.rating) params.set("rating", String(filters.rating));
  if (filters.verifiedStay !== undefined)
    params.set("verifiedStay", String(filters.verifiedStay));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const qs = params.toString();
  return apiFetch<PaginatedApartmentReviews>(
    `/apartment-reviews${qs ? `?${qs}` : ""}`,
  );
}

/**
 * Create a new review.
 * POST /api/v1/apartment-reviews
 */
export async function createApartmentReview(
  input: CreateApartmentReviewInput,
): Promise<ApartmentReview> {
  return apiFetch<ApartmentReview>("/apartment-reviews", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * Report a review.
 * POST /api/v1/apartment-reviews/:id/report
 */
export async function reportApartmentReview(
  id: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(
    `/apartment-reviews/${id}/report`,
    { method: "POST" },
  );
}