"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  getSettings,
  hasLandlordProfile,
  rememberLandlordProfile,
  updateSettings,
  type LandlordSettings,
} from "@/lib/landlordApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function LandlordOnboardingPage() {
  return (
    <AuthGuard>
      <LandlordOnboardingForm />
    </AuthGuard>
  );
}

function LandlordOnboardingForm() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [settings, setSettings] = useState<LandlordSettings | null>(null);
  const [form, setForm] = useState({ phone: "", address: "", companyName: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSettings()
      .then((current) => {
        if (hasLandlordProfile(current)) {
          router.replace("/dashboard/landlord");
          return;
        }
        setSettings(current);
        setForm({
          phone: current.profile.phone,
          address: current.profile.address,
          companyName: current.profile.companyName,
        });
      })
      .catch(() =>
        setError(
          "We couldn't load your profile. Please refresh and try again.",
        ),
      );
  }, [router]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateSettings({
        ...settings,
        profile: { ...settings.profile, ...form },
      });
      if (user) rememberLandlordProfile(user.id, true);
      router.replace("/dashboard/landlord");
    } catch {
      setError("We couldn't save your profile. Please try again.");
      setSubmitting(false);
    }
  };

  if (!settings && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" label="Loading" />
      </div>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-12">
      <Card className="w-full p-6 md:p-8">
        <h1 className="mb-1 text-2xl font-bold">
          Set up your landlord profile
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Tenants and Shelterflex use these details to reach you about your
          properties.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="landlord-phone"
              className="mb-2 block text-sm font-bold"
            >
              Phone number
            </label>
            <Input
              id="landlord-phone"
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="+234 801 234 5678"
              required
            />
          </div>
          <div>
            <label
              htmlFor="landlord-address"
              className="mb-2 block text-sm font-bold"
            >
              Address
            </label>
            <Input
              id="landlord-address"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="Where you're based, e.g. Lekki Phase 1, Lagos"
              required
            />
          </div>
          <div>
            <label
              htmlFor="landlord-company"
              className="mb-2 block text-sm font-bold"
            >
              Company name{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              id="landlord-company"
              value={form.companyName}
              onChange={(e) =>
                setForm((f) => ({ ...f, companyName: e.target.value }))
              }
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex gap-2 border-3 border-destructive p-3 text-sm font-bold text-destructive"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !settings}
            className="w-full font-bold"
          >
            {submitting ? <Spinner size="sm" className="mr-2" /> : null}
            {submitting ? "Saving…" : "Continue to dashboard"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
