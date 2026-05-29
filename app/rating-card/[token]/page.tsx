"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getSharedRatingCard,
  type PublicRatingCard,
} from "@/lib/ratingCardApi";

export default function SharedRatingCardPage() {
  const params = useParams();
  const token = params.token as string;

  const [card, setCard] = useState<PublicRatingCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    getSharedRatingCard(token)
      .then((res) => setCard(res.data))
      .catch((err) => {
        setError(
          err.message || "This share link is invalid or has expired.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.round(score)
            ? "fill-primary text-primary"
            : "text-muted-foreground"
        }`}
      />
    ));
  };

  const renderScoreBar = (label: string, score: number) => (
    <div className="flex items-center gap-3">
      <span className="w-36 text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 h-3 border-2 border-foreground bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <span className="w-8 text-right font-mono font-bold">{score}</span>
    </div>
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-3 border-foreground p-12 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] animate-pulse">
          <div className="h-40 w-80 bg-muted rounded" />
        </Card>
      </main>
    );
  }

  if (error || !card) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border-3 border-foreground p-12 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-center max-w-md">
          <Shield className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 font-mono text-xl font-bold">
            Link Unavailable
          </h2>
          <p className="mt-2 text-muted-foreground">
            {error || "This share link is invalid or has expired."}
          </p>
          <Link href="/">
            <Button className="mt-6 border-3 border-foreground bg-primary font-bold shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b-3 border-foreground bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Shield className="h-4 w-4" />
            <span>Verified Tenant Rating Card</span>
          </div>
          <h1 className="font-mono text-2xl font-black md:text-3xl">
            Tenant <span className="text-primary">Reputation</span>
          </h1>
          <p className="text-muted-foreground">
            Shared via Shelterflex — {card.totalRatings} landlord rating
            {card.totalRatings !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Composite Score */}
          <Card className="border-3 border-foreground p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] mb-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Overall Rating
              </p>
              <div className="flex items-center justify-center gap-1 mb-3">
                {renderStars(card.compositeScore)}
              </div>
              <p className="text-6xl font-mono font-black text-primary">
                {card.compositeScore}
              </p>
              <p className="text-muted-foreground mt-1">out of 5.0</p>
            </div>
          </Card>

          {/* Score Breakdown */}
          <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] mb-8">
            <h3 className="mb-4 font-bold">Score Breakdown</h3>
            <div className="space-y-4">
              {renderScoreBar("Payment History", card.paymentScore)}
              {renderScoreBar("Property Care", card.propertyCareScore)}
              {renderScoreBar("Communication", card.communicationScore)}
            </div>
          </Card>

          {/* Individual Ratings */}
          <Card className="border-3 border-foreground p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <h3 className="mb-4 font-bold">Rating History</h3>
            <div className="space-y-4">
              {card.ratings.map((rating, index) => (
                <div
                  key={index}
                  className="border-2 border-foreground p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {renderStars(
                        (rating.paymentScore +
                          rating.propertyCareScore +
                          rating.communicationScore) /
                          3,
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(rating.createdAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Payment</p>
                      <p className="font-mono font-bold">
                        {rating.paymentScore}/5
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Property Care
                      </p>
                      <p className="font-mono font-bold">
                        {rating.propertyCareScore}/5
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Communication
                      </p>
                      <p className="font-mono font-bold">
                        {rating.communicationScore}/5
                      </p>
                    </div>
                  </div>

                  {rating.comment && (
                    <p className="text-sm text-muted-foreground italic">
                      &quot;{rating.comment}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Powered by{" "}
              <Link href="/" className="font-bold text-primary underline">
                Shelterflex
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
