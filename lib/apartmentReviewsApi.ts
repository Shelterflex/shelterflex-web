/**
 * Apartment Reviews API Client
 * Handles listing, submitting, and reporting apartment reviews
 *
 * Path convention (interim, pending shelterflex-api#31): the apartment-reviews
 * router is mounted on the backend WITHOUT the /api/v1 prefix. All calls below
 * use apiGetUnversioned/apiPostUnversioned with a literal "/api/..." path,
 * bypassing the version prefix that apiFetch normally applies -- the same
 * interim workaround used by lib/tenantApi.ts and lib/creditScoreApi.ts
 * pending shelterflex-api#4. Once shelterflex-api#31 lands and this router
 * moves under /api/v1, switch these calls back to apiGet/apiPost with
 * version-relative paths (e.g. "/apartment-reviews").
 */

import { apiGetUnversioned, apiPostUnversioned } from "./apiClient";
import { withQuery } from "./apiClient";

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

export type ApartmentReviewSortBy =
  | "newest"
  | "oldest"
  | "rating_desc"
  | "rating_asc";

export interface ApartmentReviewFilters {
  apartmentId?: string;
  rating?: number;
  verifiedStay?: boolean;
  sortBy?: ApartmentReviewSortBy;
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

export interface CreateApartmentReviewInput {
  apartmentId: string;
  rating: number;
  content: string;
  verifiedStay?: boolean;
}

export interface ReportApartmentReviewResponse {
  success: boolean;
  message: string;
}

export async function listApartmentReviews(
  filters: ApartmentReviewFilters = {},
): Promise<PaginatedApartmentReviews> {
  const path = withQuery(
    "/api/apartment-reviews",
    filters as Record<string, string | number | boolean | undefined | null>,
  );
  return apiGetUnversioned<PaginatedApartmentReviews>(path);
}

export async function createApartmentReview(
  input: CreateApartmentReviewInput,
): Promise<ApartmentReview> {
  return apiPostUnversioned<ApartmentReview>("/api/apartment-reviews", input);
}

export async function reportApartmentReview(
  reviewId: string,
): Promise<ReportApartmentReviewResponse> {
  return apiPostUnversioned<ReportApartmentReviewResponse>(
    `/api/apartment-reviews/${encodeURIComponent(reviewId)}/report`,
    {},
  );
}
