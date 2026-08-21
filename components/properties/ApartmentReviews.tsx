"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Star,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  ThumbsUp,
  Flag,
  Send,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { sanitizeText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import {
  listApartmentReviews,
  createApartmentReview,
  reportApartmentReview,
  type ApartmentReview,
  type ApartmentReviewFilters,
} from "@/lib/apartmentReviewsApi";

interface ApartmentReviewsProps {
  propertyId: string;
}

// ── Rating aggregation helpers ───────────────────────────────────────────────

function computeRatingDistribution(reviews: ApartmentReview[]) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating as 1 | 2 | 3 | 4 | 5]++;
  }
  return dist;
}

function computeAverageRating(reviews: ApartmentReview[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ApartmentReviews({ propertyId }: ApartmentReviewsProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL State
  const ratingFilter = searchParams.get("rating") || "all";
  const sortBy = searchParams.get("sort") || "newest";
  const verifiedOnly = searchParams.get("verified") === "true";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ApartmentReview[]>([]);

  // Submission state
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newContent, setNewContent] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  // Report state
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: ApartmentReviewFilters = { apartmentId: propertyId };
      if (sortBy === "newest") filters.sortBy = "newest";
      else if (sortBy === "highest") filters.sortBy = "rating_desc";
      else if (sortBy === "lowest") filters.sortBy = "rating_asc";
      if (verifiedOnly) filters.verifiedStay = true;

      const result = await listApartmentReviews(filters);
      // Apply client-side rating filter since the API doesn't filter by
      // rating when also filtering by apartmentId
      let filtered = result.reviews;
      if (ratingFilter !== "all") {
        filtered = filtered.filter((r) => r.rating === Number(ratingFilter));
      }
      setReviews(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorTitle"));
    } finally {
      setLoading(false);
    }
  }, [propertyId, ratingFilter, sortBy, verifiedOnly, t]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const ratingDistribution = useMemo(
    () => computeRatingDistribution(reviews),
    [reviews],
  );
  const averageRating = useMemo(
    () => computeAverageRating(reviews),
    [reviews],
  );
  const totalReviews = reviews.length;

  // ── Filtered + sorted (client-side) ────────────────────────────────────

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by rating (already applied in fetch, but double-check)
    if (ratingFilter !== "all") {
      result = result.filter((r) => r.rating === Number(ratingFilter));
    }

    // Filter by verified
    if (verifiedOnly) {
      result = result.filter((r) => r.verifiedStay);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0;
    });

    return result;
  }, [reviews, ratingFilter, sortBy, verifiedOnly]);

  const updateFilters = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === false || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // ── Submit review ──────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (newRating === 0 || newContent.trim().length < 10) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createApartmentReview({
        apartmentId: propertyId,
        rating: newRating,
        content: newContent.trim(),
      });
      setNewRating(0);
      setNewContent("");
      setShowForm(false);
      void fetchReviews();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Report review ──────────────────────────────────────────────────────

  const handleReport = async (reviewId: string) => {
    setReportingId(reviewId);
    setReportFeedback(null);
    try {
      await reportApartmentReview(reviewId);
      setReportFeedback("reported");
    } catch (err) {
      setReportFeedback("error");
    } finally {
      setReportingId(null);
      setTimeout(() => setReportFeedback(null), 3000);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-mono">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-3 border-destructive bg-destructive/10 p-6 text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h3 className="font-bold text-destructive mb-2">{t("errorTitle")}</h3>
        <p className="text-sm text-destructive/80 mb-4">{error}</p>
        <Button
          variant="outline"
          className="border-2 border-destructive text-destructive hover:bg-destructive/20"
          onClick={() => window.location.reload()}
        >
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Rating Summary ─────────────────────────────────────────────── */}
      <div className="border-3 border-foreground bg-muted/30 p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="text-4xl font-black">{averageRating}</span>
              <span className="text-muted-foreground"> / 5</span>
              <div className="flex items-center gap-0.5 mt-1 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= Math.round(averageRating)
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted-foreground",
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 space-y-1 min-w-[160px]">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = ratingDistribution[star];
                const pct =
                  totalReviews > 0
                    ? Math.round((count / totalReviews) * 100)
                    : 0;
                return (
                  <div
                    key={star}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-8 text-right font-bold">{star}</span>
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <div className="flex-1 h-2.5 bg-muted border border-foreground">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] transition-all"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </Button>
        </div>
      </div>

      {/* ── Review Submission Form ─────────────────────────────────────── */}
      {showForm && (
        <div className="border-3 border-foreground bg-card p-6 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <h3 className="font-mono font-bold mb-4">Write Your Review</h3>

          {/* Star selector */}
          <div className="mb-4">
            <Label className="text-sm font-bold mb-2 block">
              Your Rating
            </Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= (hoveredRating || newRating)
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted-foreground",
                    )}
                  />
                </button>
              ))}
              {newRating > 0 && (
                <span className="ml-2 text-sm font-bold text-muted-foreground">
                  {newRating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <Label htmlFor="review-content" className="text-sm font-bold mb-2 block">
              Your Review
            </Label>
            <Textarea
              id="review-content"
              placeholder="Share your experience (minimum 10 characters)..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="border-2 border-foreground min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {newContent.length} / 2000
            </p>
          </div>

          {submitError && (
            <p className="text-sm text-destructive font-bold mb-4">
              {submitError}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={
                submitting ||
                newRating === 0 ||
                newContent.trim().length < 10
              }
              className="border-2 border-foreground shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setNewRating(0);
                setNewContent("");
                setSubmitError(null);
              }}
              className="border-2 border-foreground"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h2 className="font-mono text-lg font-bold">{t("filters")}</h2>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="rating-filter" className="text-sm font-bold">{t("rating")}:</Label>
            <Select value={ratingFilter} onValueChange={(v) => updateFilters("rating", v)}>
              <SelectTrigger id="rating-filter" className="w-[120px] border-2 border-foreground">
                <SelectValue placeholder={t("allStars")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStars")}</SelectItem>
                <SelectItem value="5">{t("stars5")}</SelectItem>
                <SelectItem value="4">{t("stars4")}</SelectItem>
                <SelectItem value="3">{t("stars3")}</SelectItem>
                <SelectItem value="2">{t("stars2")}</SelectItem>
                <SelectItem value="1">{t("stars1")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="sort-order" className="text-sm font-bold">{t("sort")}:</Label>
            <Select value={sortBy} onValueChange={(v) => updateFilters("sort", v)}>
              <SelectTrigger id="sort-order" className="w-[150px] border-2 border-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("newest")}</SelectItem>
                <SelectItem value="highest">{t("highest")}</SelectItem>
                <SelectItem value="lowest">{t("lowest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 border-2 border-foreground px-3 py-1.5 bg-background">
            <Checkbox
              id="verified-only"
              checked={verifiedOnly}
              onCheckedChange={(v) => updateFilters("verified", !!v)}
              className="border-2 border-foreground"
            />
            <Label htmlFor="verified-only" className="text-sm font-bold cursor-pointer">{t("verifiedStay")}</Label>
          </div>
        </div>
      </div>

      {/* ── Review List ────────────────────────────────────────────────── */}
      {filteredAndSortedReviews.length === 0 ? (
        <div className="border-3 border-foreground border-dashed p-12 text-center bg-muted/30">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="font-mono text-lg font-bold">{t("noReviews")}</p>
          <p className="text-muted-foreground mt-2">{t("adjustFilters")}</p>
          {(ratingFilter !== "all" || verifiedOnly) && (
            <Button
              variant="link"
              className="mt-2 text-primary font-bold"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("rating");
                params.delete("verified");
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });
              }}
            >
              {t("clearFilters")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedReviews.map((review) => {
            // Reviews are free-text authored by other users — sanitize before
            // rendering to prevent stored-XSS (see lib/sanitize.ts).
            const safeUserName = sanitizeText(review.userName ?? "Anonymous");
            const safeComment = sanitizeText(review.content);
            return (
              <Card key={review.id} className="border-3 border-foreground shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 border-2 border-foreground bg-secondary flex items-center justify-center font-bold">
                        {safeUserName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{safeUserName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 border-2 border-primary px-2 py-0.5">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-xs font-black">{review.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {review.verifiedStay && (
                      <div className="inline-flex items-center gap-1 bg-secondary/20 text-secondary border border-secondary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Stay
                      </div>
                    )}
                    <p className="text-sm leading-relaxed text-foreground">
                      {safeComment}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-4 border-t-2 border-dashed border-foreground/10 pt-4">
                    <button
                      className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      onClick={() => handleReport(review.id)}
                      disabled={reportingId === review.id || reportFeedback === "reported"}
                    >
                      {reportingId === review.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Flag className="h-3 w-3" />
                      )}
                      {reportFeedback === "reported" && reportingId === review.id
                        ? "Reported"
                        : "Report"}
                    </button>
                    {reportFeedback === "reported" && reportingId !== review.id && (
                      <span className="text-xs text-green-600 font-bold">✓ Reported</span>
                    )}
                    {reportFeedback === "error" && (
                      <span className="text-xs text-destructive font-bold">Report failed</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}