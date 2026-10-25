import { apiFetch } from "../api";

export interface WhistleblowerStats {
  totalEarnings: number;
  reportsThisMonth: number;
  maxReportsPerMonth: number;
  activeListings: number;
  rating: number;
  reviews: number;
}

export interface WhistleblowerListing {
  id: string | number;
  address: string;
  price: number;
  beds: number;
  baths: number;
  status: "pending" | "active" | "rejected" | "rented";
  earnings: number;
  /** ISO timestamp. */
  postedDate: string;
}

export interface WhistleblowerEarning {
  /** ISO timestamp. */
  date: string;
  listing: string;
  amount: number;
  status: "completed" | "pending";
}

export interface WhistleblowerDashboardData {
  stats: WhistleblowerStats;
  listings: WhistleblowerListing[];
  earnings: WhistleblowerEarning[];
}

export async function getWhistleblowerDashboardData(): Promise<WhistleblowerDashboardData> {
  return apiFetch<WhistleblowerDashboardData>("/whistleblower/dashboard");
}
