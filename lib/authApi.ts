import { apiPost } from "./api";
import { apiGet } from "./apiClient";
import useAuthStore from "@/store/useAuthStore";

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

/** Signup details, applied by the backend only when the account is new. */
export interface SignupProfile {
  name?: string;
  role?: "tenant" | "landlord" | "whistleblower";
}

export interface VerifyOtpResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "tenant" | "landlord" | "agent" | "whistleblower";
    roles?: ("tenant" | "landlord" | "agent" | "whistleblower")[];
  };
}

export interface WalletChallengeRequest {
  address: string;
}

export interface WalletChallengeResponse {
  challengeXdr: string;
  expiresAt: string;
}

export interface WalletVerifyRequest {
  address: string;
  signedChallengeXdr: string;
}

export interface WalletVerifyResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "tenant" | "landlord" | "agent" | "whistleblower";
    roles?: ("tenant" | "landlord" | "agent" | "whistleblower")[];
    walletAddress?: string;
  };
}

// Signup collects name and role before the OTP step, but the account is only
// created when the OTP is verified on the next page. The details wait here,
// keyed by email so they can't leak into a different account's verification.
const PENDING_SIGNUP_KEY = "shelterflex_pending_signup";

export function savePendingSignup(email: string, profile: SignupProfile): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    PENDING_SIGNUP_KEY,
    JSON.stringify({ email: email.toLowerCase(), ...profile })
  );
}

export function readPendingSignup(email: string): SignupProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(PENDING_SIGNUP_KEY);
    const pending = raw ? (JSON.parse(raw) as SignupProfile & { email?: string }) : null;
    if (!pending || pending.email !== email.toLowerCase()) return {};
    return { name: pending.name, role: pending.role };
  } catch {
    return {};
  }
}

export function clearPendingSignup(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_SIGNUP_KEY);
}

// Cache bust: 2026-04-02-10-31
export async function requestOtp(email: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/auth/request-otp", { email });
}

export async function verifyOtp(
  email: string,
  otp: string,
  profile: SignupProfile = {}
): Promise<VerifyOtpResponse> {
  const res = await apiPost<VerifyOtpResponse>("/auth/verify-otp", {
    email,
    otp,
    ...profile,
  });
  useAuthStore.getState().setSession(res.token, res.user);
  return res;
}

export interface CurrentUserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: "tenant" | "landlord" | "agent" | "whistleblower";
    roles?: ("tenant" | "landlord" | "agent" | "whistleblower")[];
    walletAddress?: string | null;
    displayCurrency?: "NGN" | "USDC";
  };
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  return apiGet<CurrentUserResponse>("/auth/me");
}

export async function requestWalletChallenge(address: string): Promise<WalletChallengeResponse> {
  return apiPost<WalletChallengeResponse>("/auth/wallet/challenge", { address });
}

export async function verifyWalletSignature(
  address: string,
  signedChallengeXdr: string
): Promise<WalletVerifyResponse> {
  const res = await apiPost<WalletVerifyResponse>("/auth/wallet/verify", {
    address,
    signedChallengeXdr,
  });
  useAuthStore.getState().setSession(res.token, res.user);
  return res;
}
/** Registers the signed-in account for another role, so it gets that dashboard too. */
export async function addRole(role: "tenant" | "landlord" | "whistleblower"): Promise<void> {
  const { user } = await apiPost<CurrentUserResponse>("/auth/roles", { role });
  useAuthStore.getState().setUser(user);
}
