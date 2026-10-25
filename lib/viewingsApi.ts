/**
 * Apartment viewings. Daytime only, arranged in-app (no phone numbers shared),
 * and a first-time reporter's viewing needs an inspector before it is confirmed.
 */

import { apiGet, apiPost } from "./apiClient";

export type ViewingStatus =
  | "requested"
  | "awaiting_inspector"
  | "confirmed"
  | "declined"
  | "cancelled";

export interface Viewing {
  viewingId: string;
  listingId: string;
  /** ISO timestamp. */
  startsAt: string;
  status: ViewingStatus;
  /** The signed-in user's part in it. */
  role: "tenant" | "reporter" | "inspector";
  requiresInspector: boolean;
  inspectorAssigned: boolean;
  place: string | null;
  /** Only given once the viewing is confirmed (or to inspectors). */
  address: string | null;
  tenantFirstName: string;
  reporterFirstName: string;
}

/** First and last bookable hours, in Lagos time; viewings end by 5pm. */
export const FIRST_HOUR = 9;
export const LAST_HOUR = 16;
const WAT_OFFSET_HOURS = 1;

export function hourLabel(hour: number): string {
  const suffix = hour >= 12 ? "pm" : "am";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${suffix}`;
}

/** Turns a calendar date (YYYY-MM-DD) and a Lagos-time hour into an ISO timestamp. */
export function slotToIso(date: string, hourWat: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!, hourWat - WAT_OFFSET_HOURS)).toISOString();
}

export async function requestViewing(input: {
  listingId: string;
  startsAt: string;
}): Promise<Viewing> {
  const res = await apiPost<{ data: Viewing }>("/viewings", input, { maxRetries: 0 });
  return res.data;
}

export async function listMyViewings(): Promise<Viewing[]> {
  return (await apiGet<{ data: Viewing[] }>("/viewings")).data;
}

export async function listViewingsNeedingInspector(): Promise<Viewing[]> {
  return (await apiGet<{ data: Viewing[] }>("/viewings/open-for-inspectors")).data;
}

export async function respondToViewing(
  viewingId: string,
  action: "accept" | "decline",
): Promise<Viewing> {
  const res = await apiPost<{ data: Viewing }>(
    `/viewings/${encodeURIComponent(viewingId)}/respond`,
    { action },
    { maxRetries: 0 },
  );
  return res.data;
}

export async function claimViewing(viewingId: string): Promise<Viewing> {
  const res = await apiPost<{ data: Viewing }>(
    `/viewings/${encodeURIComponent(viewingId)}/claim`,
    {},
    { maxRetries: 0 },
  );
  return res.data;
}

export async function cancelViewing(viewingId: string): Promise<Viewing> {
  const res = await apiPost<{ data: Viewing }>(
    `/viewings/${encodeURIComponent(viewingId)}/cancel`,
    {},
    { maxRetries: 0 },
  );
  return res.data;
}
