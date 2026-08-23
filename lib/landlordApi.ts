import { apiFetch } from "./api";
import { apiPost } from "./api";
import { apiGet, apiPatch } from "./apiClient";
import type { LandlordVerificationLevel } from "@/components/LandlordVerificationBadge";

export interface LandlordStat {
  label: string;
  value: string;
  icon: string; // Icon name to be mapped in the component
  color: string;
}

export interface LandlordProperty {
  id: number | string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqm: number;
  status: "active" | "pending" | "inactive";
  views: number;
  inquiries: number;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  image?: string;
  tenant?: {
    name: string;
    avatar: string;
  } | null;
}

export interface LandlordDashboardData {
  stats: LandlordStat[];
  properties: LandlordProperty[];
}

export interface OccupancyData {
  date: string;
  rate: number;
}

export interface RevenueData {
  month: string;
  expected: number;
  collected: number;
}

export interface PaymentTrendData {
  date: string;
  onTime: number;
  late: number;
  missed: number;
}

export interface VacancyMetrics {
  averageTimeToFill: number;
  currentVacancyCount: number;
}

export interface LandlordAnalytics {
  occupancyTrend: OccupancyData[];
  revenueBreakdown: RevenueData[];
  paymentTrends: PaymentTrendData[];
  vacancyMetrics: VacancyMetrics;
}

export interface LandlordTenant {
  id: string;
  name: string;
  property: string;
  status: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyPayment: number;
  totalPaid: number;
  verified: boolean;
}

export interface LandlordSettings {
  profile: {
    fullName: string;
    email: string;
    companyName: string;
    phone: string;
    address: string;
  };
  notifications: {
    newInquiries: boolean;
    paymentUpdates: boolean;
    propertyViews: boolean;
    marketingTips: boolean;
  };
  payout: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface LandlordVerificationStatus {
  level: LandlordVerificationLevel;
  verifiedAt: string | null;
}

export async function getTenants(): Promise<LandlordTenant[]> {
  return apiGet<LandlordTenant[]>("/landlord/tenants");
}

export async function getSettings(): Promise<LandlordSettings> {
  return apiGet<LandlordSettings>("/landlord/settings");
}

export async function updateSettings(
  settings: LandlordSettings,
): Promise<{ success: boolean }> {
  return apiPatch<{ success: boolean }>("/landlord/settings", settings);
}

export async function getVerificationStatus(
  landlordId: string,
): Promise<LandlordVerificationStatus> {
  return apiGet<LandlordVerificationStatus>(
    `/landlords/${encodeURIComponent(landlordId)}/verification-status`,
  );
}

export const landlordApi = {
  getDashboardData: async (): Promise<LandlordDashboardData> => {
    return apiFetch<LandlordDashboardData>("/landlord/dashboard");
  },

  getProperties: async (): Promise<LandlordProperty[]> => {
    return apiFetch<LandlordProperty[]>("/landlord/properties");
  },

  getProperty: async (id: string | number): Promise<LandlordProperty> => {
    return apiFetch<LandlordProperty>(`/landlord/properties/${id}`);
  },

  getApplications: async (): Promise<any[]> => {
    return apiFetch<any[]>("/landlord/applications");
  },

  getAnalytics: async (params?: { startDate?: string; endDate?: string; propertyId?: string }): Promise<LandlordAnalytics> => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<LandlordAnalytics>(`/landlord/analytics?${query}`);
  },

  createProperty: async (payload: unknown): Promise<any> => {
    return apiPost<any>("/landlord/properties", payload);
  },
};
