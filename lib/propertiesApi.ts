/**
 * Properties API Client
 * Handles property search and listing operations
 */

import { apiGet } from "./apiClient";
import { withQuery } from "./apiClient";

export interface PropertySearchFilters {
  city?: string;
  area?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minAnnualRent?: number;
  maxAnnualRent?: number;
  query?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "bedrooms_desc";
  page?: number;
  pageSize?: number;
}

export interface PropertyListing {
  listingId: string;
  whistleblowerId: string;
  address: string;
  city?: string;
  area?: string;
  bedrooms: number;
  bathrooms: number;
  annualRentNgn: number;
  outrightPriceNgn?: number;
  installmentBasePriceNgn?: number;
  hasApprovedInspection?: boolean;
  description?: string;
  photos: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertySearchResponse {
  success: boolean;
  data: PropertyListing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PropertyDetailResponse {
  success: boolean;
  data: PropertyListing;
}

export async function searchProperties(
  filters: PropertySearchFilters,
): Promise<PropertySearchResponse> {
  const path = withQuery("/api/properties/search", filters as Record<string, string | number | boolean | undefined | null>);
  return apiGet<PropertySearchResponse>(path);
}

export async function getProperty(
  id: string,
): Promise<PropertyDetailResponse> {
  return apiGet<PropertyDetailResponse>(`/api/properties/${id}`);
}
