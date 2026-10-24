/**
 * Apartment Reviews API Client
 * Handles listing, submitting, and reporting apartment reviews via
 * /api/v1/apartment-reviews.
 */

import { apiGet, apiPost } from "./apiClient";
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
    "/apartment-reviews",
    filters as Record<string, string | number | boolean | undefined | null>,
  );
  return apiGet<PaginatedApartmentReviews>(path);
}

export async function createApartmentReview(
  input: CreateApartmentReviewInput,
): Promise<ApartmentReview> {
  return apiPost<ApartmentReview>("/apartment-reviews", input);
}

export async function reportApartmentReview(
  reviewId: string,
): Promise<ReportApartmentReviewResponse> {
  return apiPost<ReportApartmentReviewResponse>(
    `/apartment-reviews/${encodeURIComponent(reviewId)}/report`,
    {},
  );
}
