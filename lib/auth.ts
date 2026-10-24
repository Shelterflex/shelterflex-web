export const TOKEN_KEY = "shelterflex_token";
// Mirrors AUTH_STORAGE_KEY in store/useAuthStore (imported there from here, so
// it can't be imported back without a cycle).
const AUTH_PROFILE_KEY = "shelterflex-auth-storage";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  clearToken();
  // Redirect to homepage after logout
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

/**
 * Called when the API rejects the stored token as expired or invalid: drops the
 * dead session and sends the user to log in, returning them here afterwards.
 */
export function handleSessionExpired(): void {
  if (typeof window === "undefined") return;
  clearToken();
  const { pathname, search } = window.location;
  if (pathname === "/login" || pathname === "/verify-otp") return;
  window.location.href = `/login?returnTo=${encodeURIComponent(pathname + search)}`;
}

// Function to handle post-authentication redirect
export function handleAuthRedirect(returnTo?: string): void {
  if (typeof window === "undefined") return;
  
  const targetUrl = returnTo ? decodeURIComponent(returnTo) : "/";
  
  // Prevent infinite redirect loops
  if (window.location.pathname === targetUrl) {
    return;
  }
  
  window.location.href = targetUrl;
}