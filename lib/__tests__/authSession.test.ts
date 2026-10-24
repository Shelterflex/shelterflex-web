import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const apiPost = vi.fn();
vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiPost: (...args: unknown[]) => apiPost(...args),
}));

const TOKEN_KEY = "shelterflex_token";
const AUTH_KEY = "shelterflex-auth-storage";
const user = { id: "u1", email: "amaka@example.com", name: "Amaka Obi", role: "landlord" as const };

// The store reads localStorage when its module loads, so each test imports a
// fresh copy after arranging storage.
async function loadModules() {
  vi.resetModules();
  const { default: useAuthStore } = await import("@/store/useAuthStore");
  const authApi = await import("@/lib/authApi");
  await useAuthStore.persist.rehydrate();
  return { useAuthStore, authApi };
}

describe("auth session state", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    apiPost.mockReset();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("verifyOtp records the token and user in the store", async () => {
    const { useAuthStore, authApi } = await loadModules();
    apiPost.mockResolvedValue({ token: "tok-1", user });

    await authApi.verifyOtp(user.email, "123456");

    expect(useAuthStore.getState()).toMatchObject({ token: "tok-1", isAuthenticated: true, user });
    expect(localStorage.getItem(TOKEN_KEY)).toBe("tok-1");
  });

  it("a stale persisted logged-out state does not override a live token", async () => {
    // What older builds left behind: the store's own copy saying "logged out"
    // next to the real token written by verifyOtp.
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      state: { token: null, user: null, isAuthenticated: false },
      version: 1,
    }));
    localStorage.setItem(TOKEN_KEY, "tok-live");

    const { useAuthStore } = await loadModules();

    expect(useAuthStore.getState()).toMatchObject({ token: "tok-live", isAuthenticated: true });
  });

  it("only the user profile is persisted, never the token", async () => {
    const { useAuthStore } = await loadModules();
    useAuthStore.getState().setSession("tok-2", user);

    const persisted = JSON.parse(localStorage.getItem(AUTH_KEY) ?? "{}");
    expect(persisted.state).toEqual({ user });
  });

  it("a persisted user is dropped once the token is gone", async () => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ state: { user }, version: 2 }));

    const { useAuthStore } = await loadModules();

    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, user: null });
  });

  it("signup details reach verify-otp only for the same email", async () => {
    const { authApi } = await loadModules();
    authApi.savePendingSignup("Amaka@Example.com", { name: "Amaka Obi", role: "landlord" });

    expect(authApi.readPendingSignup("amaka@example.com")).toEqual({ name: "Amaka Obi", role: "landlord" });
    expect(authApi.readPendingSignup("someone@else.com")).toEqual({});
  });
});
