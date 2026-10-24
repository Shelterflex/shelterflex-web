"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { getCurrentUser } from "@/lib/authApi";

// One /auth/me request at a time, however many components ask for the user.
let pending: Promise<void> | null = null;

/**
 * The logged-in user. Login fills this in directly; for a session that
 * predates the stored profile, it is fetched once from /auth/me.
 */
export function useCurrentUser() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || user || pending) return;
    pending = getCurrentUser()
      .then(({ user: me }) => useAuthStore.getState().setUser(me))
      .catch(() => {
        // An expired session is handled by the API client; anything else just
        // leaves the profile empty until the next attempt.
      })
      .finally(() => {
        pending = null;
      });
  }, [isAuthenticated, user]);

  return { user, isAuthenticated };
}
