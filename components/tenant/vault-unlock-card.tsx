"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requestVaultCode, unlockVault } from "@/lib/vaultUnlockApi";

interface VaultUnlockCardProps {
  onUnlocked: () => void;
}

/** Asks for an emailed code before the vault opens. */
export function VaultUnlockCard({ onUnlocked }: VaultUnlockCardProps) {
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setBusy(true);
    setError(null);
    try {
      await requestVaultCode();
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await unlockVault(code);
      onUnlocked();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
      <div className="flex h-14 w-14 items-center justify-center border-3 border-foreground bg-primary">
        <LockKeyhole className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-bold">Your vault is locked</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your IDs and agreements are sensitive, so we check it&apos;s really you
        each time. We&apos;ll email you a 6-digit code. It unlocks the vault for
        10 minutes.
      </p>

      {!codeSent ? (
        <Button
          onClick={sendCode}
          disabled={busy}
          className="mt-6 w-full border-3 border-foreground bg-primary font-bold"
        >
          {busy ? "Sending…" : "Email me a code"}
        </Button>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <label htmlFor="vault-code" className="block text-sm font-bold">
            Enter the code we emailed you
          </label>
          <input
            id="vault-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full border-3 border-foreground bg-background px-3 py-2 text-center font-mono text-2xl tracking-[0.5em]"
          />
          <Button
            type="submit"
            disabled={busy || code.length !== 6}
            className="w-full border-3 border-foreground bg-primary font-bold"
          >
            {busy ? "Checking…" : "Unlock vault"}
          </Button>
          <button
            type="button"
            onClick={sendCode}
            disabled={busy}
            className="w-full text-sm font-bold underline"
          >
            Send a new code
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm font-bold text-destructive">
          {error}
        </p>
      )}
    </Card>
  );
}
