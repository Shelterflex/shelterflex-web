import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { logger } from "./logger";
import { TOKEN_KEY, getToken, setToken as saveToken, clearToken } from "@/lib/auth";

export type UserRole = "tenant" | "landlord" | "agent" | "inspector" | "admin" | "whistleblower";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  walletAddress?: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  /** Records a fresh login: stores the token and the user it belongs to. */
  setSession: (token: string, user: User) => void;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// The token itself lives under TOKEN_KEY (lib/auth), which the API client reads
// directly. This store only persists the user profile and always derives
// token/isAuthenticated from TOKEN_KEY, so the two can never disagree.
export const AUTH_STORAGE_KEY = "shelterflex-auth-storage";

const useAuthStore = create<AuthState>()(
  logger(
    persist(
      (set) => ({
        token: getToken(),
        user: null,
        isAuthenticated: !!getToken(),
        setSession: (token, user) => {
          saveToken(token);
          set({ token, user, isAuthenticated: true });
        },
        setToken: (token) => {
          if (token) {
            saveToken(token);
          } else {
            clearToken();
          }
          set((s) => ({ token, isAuthenticated: !!token, user: token ? s.user : null }));
        },
        setUser: (user) => set({ user }),
        logout: () => {
          clearToken();
          set({ token: null, user: null, isAuthenticated: false });
        },
      }),
      {
        name: AUTH_STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        version: 2,
        partialize: (state) => ({ user: state.user }),
        // Older versions persisted token/isAuthenticated too, and a stale
        // `token: null` from before login overwrote the real session on reload.
        migrate: (persisted) => ({ user: (persisted as Partial<AuthState>)?.user ?? null }),
        merge: (persisted, current) => {
          const token = getToken();
          const user = (persisted as Partial<AuthState> | undefined)?.user ?? null;
          return { ...current, token, isAuthenticated: !!token, user: token ? user : null };
        },
      }
    ),
    "AuthStore"
  )
);

// Keep every open tab in step: logging in or out in one tab updates the rest.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === TOKEN_KEY || event.key === AUTH_STORAGE_KEY || event.key === null) {
      void useAuthStore.persist.rehydrate();
    }
  });
}

export default useAuthStore;
