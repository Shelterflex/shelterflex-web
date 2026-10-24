// Requests go through the shared client, which adds the /api/v1 prefix and the
// signed-in user's token.
import { apiGet, apiPost } from './apiClient';

export interface InspectorProfile {
  userId: string;
  verificationStatus: 'pending' | 'verified' | 'suspended';
  bio?: string;
  serviceAreas: string[];
  completedInspections: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyInspection {
  id: string;
  listingId: string;
  inspectorId: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  scheduledAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  inspectorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionJob {
  id: string;
  listingId: string;
  address?: string;
  propertyTitle?: string;
  inspectionType?: 'new_listing' | 're_inspection';
  offeredFee?: number;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'available' | 'claimed' | 'completed';
  scheduledAt?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface InspectorEarnings {
  inspectorId: string;
  completedInspections: number;
  totalEarnings: number;
  inspections: Array<{
    id: string;
    listingId: string;
    completedAt: string;
    fee: number;
  }>;
}

export interface InspectionSummary {
  inspectionId: string;
  listingId: string;
  approvedAt: string;
  categoryResults: Record<string, { pass: number; fail: number; na: number }>;
  totalItems: number;
  passCount: number;
  failCount: number;
  photoCount: number;
}

export const propertyInspectionApi = {
  // Inspector Application
  async applyAsInspector(data: { bio?: string; serviceAreas: string[] }): Promise<InspectorProfile> {
    return apiPost('/inspector/apply', data);
  },

  // Jobs
  async getAvailableJobs(): Promise<InspectionJob[]> {
    return apiGet('/inspector/jobs');
  },

  async acceptJob(inspectionId: string): Promise<PropertyInspection> {
    return apiPost(`/inspector/jobs/${inspectionId}/accept`, {});
  },

  // Earnings
  async getEarnings(): Promise<InspectorEarnings> {
    return apiGet('/inspector/earnings');
  },

  // Public Inspection Summary
  async getInspectionSummary(propertyId: string): Promise<InspectionSummary> {
    return apiGet(`/properties/${propertyId}/inspection-summary`);
  },
};
