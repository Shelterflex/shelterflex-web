/**
 * Inspector Dashboard API Client
 *
 * Wires inspector onboarding to POST /inspector/apply, and the inspector
 * dashboard to GET /jobs, POST /jobs/:id/claim, and POST /jobs/:id/report on
 * the backend.
 */

import { apiGet, apiPost } from "./apiClient";

// ── Backend API response types ──────────────────────────────────────

export type BackendJobStatus =
  | "available"
  | "claimed"
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected";

export type InspectorVerificationStatus = "pending" | "verified" | "suspended";

/** Shape returned by POST /inspector/apply (models/inspectorProfile.ts). */
export interface BackendInspectorProfile {
  userId: string;
  verificationStatus: InspectorVerificationStatus;
  bio?: string;
  serviceAreas: string[];
  completedInspections: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendInspectionJob {
  id: string;
  listingId: string;
  inspectorId?: string;
  status: BackendJobStatus;
  offeredFeeNgn: number;
  claimDeadline?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendInspectionReport {
  id: string;
  jobId: string;
  overallGrade: "A" | "B" | "C" | "D";
  roomChecklist: Record<string, unknown>;
  photoKeys: string[];
  notes: string;
  submittedAt: string;
}

interface BackendInspectorProfileResponse {
  success: true;
  data: BackendInspectorProfile;
}

interface BackendListJobsResponse {
  success: true;
  data: BackendInspectionJob[];
}

interface BackendJobResponse {
  success: true;
  data: BackendInspectionJob;
}

interface BackendReportResponse {
  success: true;
  data: {
    job: BackendInspectionJob;
    report: BackendInspectionReport;
  };
}

// ── Frontend-facing types (match existing InspectorJob shape) ───────

export type InspectionType = "new_listing" | "re_inspection";
export type JobStatus = "available" | "claimed" | "in_progress" | "completed";
export type PaymentStatus = "pending" | "paid";

export interface InspectorJob {
  id: string;
  listingId: string;
  propertyTitle: string;
  address: string;
  inspectionType: InspectionType;
  offeredFee: number;
  deadline: string;
  status: JobStatus;
  claimedBy?: string;
  claimedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface InspectorEarning {
  id: string;
  jobId: string;
  propertyTitle: string;
  address: string;
  inspectionType: InspectionType;
  fee: number;
  status: PaymentStatus;
  completedAt: string;
  paidAt?: string;
}

// ── API functions ───────────────────────────────────────────────────

/**
 * Payload accepted by the backend's `createInspectorProfileSchema`:
 * `{ bio?: string; serviceAreas: string[] }`. Nothing else is stored on the
 * profile, so callers must not send extra keys expecting them to persist.
 */
export interface InspectorApplicationPayload {
  bio?: string;
  serviceAreas: string[];
}

/**
 * Submit an inspector application (POST /inspector/apply).
 *
 * Requires an authenticated user; the created profile is keyed by that user's
 * id and starts at `verificationStatus: "pending"`.
 */
export async function applyAsInspector(
  payload: InspectorApplicationPayload,
): Promise<BackendInspectorProfile> {
  const response = await apiPost<BackendInspectorProfileResponse>(
    "/inspector/apply",
    payload,
  );
  return response.data;
}

export async function getInspectorJobs(): Promise<InspectorJob[]> {
  const response = await apiGet<BackendListJobsResponse>(
    "/inspector/jobs",
  );
  return (response.data ?? []).map(mapBackendJob);
}

export async function claimJob(jobId: string): Promise<InspectorJob> {
  const response = await apiPost<BackendJobResponse>(
    `/inspector/jobs/${jobId}/claim`,
    {},
  );
  return mapBackendJob(response.data);
}

export interface SubmitReportPayload {
  overallGrade: "A" | "B" | "C" | "D";
  roomChecklist: Record<string, unknown>;
  photoKeys: string[];
  notes: string;
}

export async function submitReport(
  jobId: string,
  payload: SubmitReportPayload,
): Promise<{ job: InspectorJob; report: BackendInspectionReport }> {
  const response = await apiPost<BackendReportResponse>(
    `/inspector/jobs/${jobId}/report`,
    payload,
  );
  return {
    job: mapBackendJob(response.data.job),
    report: response.data.report,
  };
}

// ── Mappers ─────────────────────────────────────────────────────────

function mapBackendJob(b: BackendInspectionJob): InspectorJob {
  const status = mapStatus(b.status);
  return {
    id: b.id,
    listingId: b.listingId,
    propertyTitle: `Listing #${b.listingId.slice(0, 8)}`,
    address: "",
    inspectionType: "new_listing",
    offeredFee: b.offeredFeeNgn,
    deadline: b.claimDeadline || b.createdAt,
    status,
    claimedBy: b.inspectorId,
    claimedAt: undefined,
    completedAt: b.approvedAt || b.submittedAt,
    createdAt: b.createdAt,
  };
}

function mapStatus(s: BackendJobStatus): JobStatus {
  switch (s) {
    case "available":
      return "available";
    case "claimed":
      return "claimed";
    case "in_progress":
      return "in_progress";
    case "submitted":
    case "approved":
    case "rejected":
      return "completed";
  }
}
