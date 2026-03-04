import { apiFetch } from "./api";


export interface HealthResponse {
  status: string;
  version: string;
  uptimeSeconds: number;
}

export interface StakingPositionReponse {
  success: boolean;
  position: {
    staked: string;
    claimable: string;
  }
}

export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}


export function getStakingPosition(): Promise<StakingPositionReponse> {
  return apiFetch<StakingPositionReponse>("/api/staking/position");
}