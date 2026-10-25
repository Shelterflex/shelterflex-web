"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/components/auth-guard";
import { getIdentityStatus, verifyIdentity } from "@/lib/api/whistleblowerIdentity";

export default function VerifyIdentityPage() {
  return (
    <AuthGuard>
      <VerifyIdentityForm />
    </AuthGuard>
  );
}

function VerifyIdentityForm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<{ blob: Blob; url: string } | null>(null);
  const [nin, setNin] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getIdentityStatus()
      .then((s) => setDone(s.verified))
      .catch(() => {});
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);
  useEffect(() => () => {
    if (selfie) URL.revokeObjectURL(selfie.url);
  }, [selfie]);

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setCameraError("We couldn't open your camera. Allow camera access in your browser, then try again.");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setSelfie({ blob, url: URL.createObjectURL(blob) });
        stopCamera();
      },
      "image/jpeg",
      0.92,
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selfie) return;
    setBusy(true);
    setError(null);
    try {
      await verifyIdentity({ selfie: selfie.blob, nin });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = !!selfie && /^\d{11}$/.test(nin) && consent && !busy;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/whistleblower/dashboard"
          className="mb-8 inline-flex items-center gap-2 border-b-2 border-foreground text-sm font-bold hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mx-auto max-w-xl">
          <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            {done ? (
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center border-3 border-foreground bg-secondary">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                </div>
                <h1 className="mb-2 text-2xl font-black">You&apos;re verified</h1>
                <p className="mb-6 text-muted-foreground">
                  You can now report apartments and start earning.
                </p>
                <Link href="/whistleblower/report">
                  <Button className="border-3 border-foreground bg-primary font-bold">
                    Report an apartment
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-6">
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-black">
                    <ShieldCheck className="h-7 w-7" />
                    Verify it&apos;s you
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Every Shelterflex whistleblower is a real, identified person.
                    That keeps tenants safe, and keeps you safe too. We match a
                    live selfie to your National ID. We don&apos;t keep the selfie
                    or your NIN, only the result.
                  </p>
                </div>

                <div>
                  <label htmlFor="nin" className="mb-1 block text-sm font-bold">
                    National Identification Number (NIN)
                  </label>
                  <Input
                    id="nin"
                    inputMode="numeric"
                    maxLength={11}
                    value={nin}
                    onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                    placeholder="11 digits"
                    className="border-3 border-foreground py-3"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold">Selfie</p>
                  <div className="border-3 border-foreground bg-muted p-3 text-center">
                    {selfie ? (
                      <div className="space-y-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview of the captured selfie */}
                        <img
                          src={selfie.url}
                          alt="Your selfie"
                          className="mx-auto max-h-64 -scale-x-100"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelfie(null);
                            void startCamera();
                          }}
                          className="border-2 border-foreground font-bold"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retake
                        </Button>
                      </div>
                    ) : cameraOn ? (
                      <div className="space-y-3">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="mx-auto max-h-64 -scale-x-100"
                        />
                        <Button
                          type="button"
                          onClick={capture}
                          className="border-3 border-foreground bg-primary font-bold"
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          Take photo
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={startCamera}
                        className="border-3 border-foreground bg-primary font-bold"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Open camera
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Face the camera in good light. Remove sunglasses and hats.
                  </p>
                  {cameraError && (
                    <p role="alert" className="mt-2 text-sm font-bold text-destructive">
                      {cameraError}
                    </p>
                  )}
                </div>

                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I agree to Shelterflex using my selfie and NIN to verify my
                    identity through our identity partner. This is biometric
                    data, and I understand only the result is kept.
                  </span>
                </label>

                {error && (
                  <p role="alert" className="text-sm font-bold text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full border-3 border-foreground bg-primary py-5 font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
                >
                  {busy ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Verifying…
                    </>
                  ) : (
                    "Verify my identity"
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
