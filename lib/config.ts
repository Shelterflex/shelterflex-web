import { apiFetch } from "./api";


export interface HealthResponse {
  ok: boolean;
  service: string;
  env: string;
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}