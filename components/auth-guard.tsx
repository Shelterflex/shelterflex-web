"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";

type AuthState = "checking" | "authed" | "redirecting";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>("checking");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated()) {
        // Login collects the email and carries returnTo through verification;
        // /verify-otp on its own has no email to verify against.
        const returnTo = encodeURIComponent(pathname);
        router.replace(`/login?returnTo=${returnTo}`);
      } else {
        setAuthState("authed");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [router, pathname]);

  if (authState === "checking" || authState === "redirecting") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}