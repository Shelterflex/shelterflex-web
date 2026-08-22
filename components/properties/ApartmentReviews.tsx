"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Flag,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import {
  listApartmentReviews,
  createApartmentReview,
  reportApartmentReview,
  type ApartmentReview,
  type ApartmentReviewSortBy,
} from "@/lib/apartmentReviewsApi";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { sanitizeText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/useAuthStore";

interface ApartmentReviewsProps {
  propertyId: string;
}

interface RatingStats {
  average: number;
  total: number;
  distribution: number[]; // index 0 -> 1 star ... index 4 -> 5 stars
}

const REVIEW_CONTENT_MIN_LENGTH = 10;
const REVIEW_PAGE_SIZE = 100;

function toBackendSortBy(sortBy: string): ApartmentReviewSortBy {
  if (sortBy === "highest") return "rating_desc";
  if (sortBy === "lowest") return "rating_asc";
  return "newest";
}

export function ApartmentReviews({ propertyId }: ApartmentReviewsProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  // URL State
  const ratingFilter = searchParams.get("rating") || "all";
  const sortBy = searchParams.get("sort") || "newest";
  const verifiedOnly = searchParams.get("verified") === "true";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ApartmentReview[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);

  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const [reportingId, setReportingId] = useState<string | null>(null);

  const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newContent, setNewContent] = useState("");
  const [newVerifiedStay, setNewVerifiedStay] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFormError, setReviewFormError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listApartmentReviews({
        apartmentId: propertyId,
        rating: ratingFilter !== "all" ? Number(ratingFilter) : undefined,
        verifiedStay: verifiedOnly || undefined,
        sortBy: toBackendSortBy(sortBy),
        pageSize: REVIEW_PAGE_SIZE,
      });
      setReviews(result.reviews);
    } catch {
      setError(t("errorTitle"));
    } finally {
      setLoading(false);
    }
  }, [propertyId, ratingFilter, sortBy, verifiedOnly, t]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await listApartmentReviews({
        apartmentId: propertyId,
        sortBy: "newest",
        pageSize: REVIEW_PAGE_SIZE,
      });
      const distribution = [0, 0, 0, 0, 0];
      let sum = 0;
      for (const review of result.reviews) {
        sum += review.rating;
        const index = Math.min(Math.max(Math.round(review.rating), 1), 5) - 1;
        distribution[index] += 1;
      }
      setStats({
        average: result.reviews.length > 0 ? sum / result.reviews.length : 0,
        total: result.total,
        distribution,
      });
    } catch {
      setStats(null);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateFilters = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === false || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetReviewForm = () => {
    setNewRating(0);
    setHoverRating(0);
    setNewContent("");
    setNewVerifiedStay(false);
    setReviewFormError(null);
  };

  const handleReviewDialogChange = (open: boolean) => {
    setReviewDialogOpen(open);
    if (!open) {
      resetReviewForm();
    }
  };

  const handleSubmitReview = async () => {
    if (newRating < 1 || newRating > 5) {
      setReviewFormError(t("form.ratingRequired"));
      return;
    }
    if (newContent.trim().length < REVIEW_CONTENT_MIN_LENGTH) {
      setReviewFormError(t("form.contentTooShort"));
      return;
    }

    setIsSubmittingReview(true);
    setReviewFormError(null);
    try {
      await createApartmentReview({
        apartmentId: propertyId,
        rating: newRating,
        content: newContent.trim(),
        verifiedStay: newVerifiedStay,
      });
      showSuccessToast(t("form.success"));
      setReviewDialogOpen(false);
      resetReviewForm();
      await Promise.all([fetchReviews(), fetchStats()]);
    } catch (err) {
      showErrorToast(err, t("form.error"));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReport = async (reviewId: string) => {
    setReportingId(reviewId);
    try {
      await reportApartmentReview(reviewId);
      setReportedIds((prev) => new Set(prev).add(reviewId));
      showSuccessToast(t("reportSuccess"));
    } catch (err) {
      showErrorToast(err, t("reportError"));
    } finally {
      setReportingId(null);
    }
  };

  const writeReviewControl = isAuthenticated ? (
    <Button
      onClick={() => setReviewDialogOpen(true)}
      className="border-2 border-foreground bg-primary font-bold shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
    >
      <PenLine className="mr-2 h-4 w-4" />
      {t("writeReview")}
    </Button>
  ) : (
    <Link href="/login">
      <Button variant="outline" className="border-2 border-foreground font-bold">
        {t("signInToReview")}
      </Button>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-3 border-foreground bg-card p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {stats && stats.total > 0 ? (
            <>
              <div className="flex items-center gap-1">
                <Star className="h-6 w-6 fill-primary text-primary" />
                <span className="font-mono text-2xl font-black">{stats.average.toFixed(1)}</span>
              </div>
              <div>
                <p className="text-sm font-bold">
                  {stats.total === 1 ? t("basedOnOne") : t("basedOnMany", { count: stats.total })}
                </p>
                <div className="mt-1 space-y-0.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.distribution[star - 1];
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-3 font-mono">{star}</span>
                        <div className="h-1.5 w-24 border border-foreground/30 bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 font-mono">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground font-mono">{t("noRatingYet")}</p>
          )}
        </div>
        {writeReviewControl}
      </div>

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-mono">{t("loading")}</p>
        </div>
      ) : error ? (
        <div className="border-3 border-destructive bg-destructive/10 p-6 text-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="font-bold text-destructive mb-2">{t("errorTitle")}</h3>
          <p className="text-sm text-destructive/80 mb-4">{error}</p>
          <Button
            variant="outline"
            className="border-2 border-destructive text-destructive hover:bg-destructive/20"
            onClick={() => fetchReviews()}
          >
            {t("tryAgain")}
          </Button>
        </div>
      ) : reviews.length === 0 ? (
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
          {reviews.map((review) => {
            // Reviews are free-text authored by other users — sanitize before
            // rendering to prevent stored-XSS (see lib/sanitize.ts).
            const safeUserName = sanitizeText(review.userName || t("anonymous"));
            const safeContent = sanitizeText(review.content);
            const isReported = reportedIds.has(review.id) || review.isReported;
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
                      <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("en-NG", { dateStyle: 'medium' })}</p>
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
                      {t("verifiedStayBadge")}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-foreground">
                    {safeContent}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-4 border-t-2 border-dashed border-foreground/10 pt-4">
                  <button
                    type="button"
                    disabled={isReported || reportingId === review.id}
                    onClick={() => handleReport(review.id)}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Flag className="h-3 w-3" />
                    {isReported ? t("reported") : t("report")}
                  </button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isReviewDialogOpen} onOpenChange={handleReviewDialogChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("form.title")}</DialogTitle>
            <DialogDescription>{t("form.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-2">{t("form.ratingLabel")}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={t("form.starLabel", { count: star })}
                    className="flex h-10 w-10 items-center justify-center border-2 border-foreground transition-all"
                  >
                    <Star
                      className={cn(
                        "h-5 w-5",
                        star <= (hoverRating || newRating)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="review-content" className="text-sm font-bold">{t("form.contentLabel")}</Label>
              <Textarea
                id="review-content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={t("form.contentPlaceholder")}
                className="mt-1 border-2 border-foreground min-h-28"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newContent.length}/2000
              </p>
            </div>

            <div className="flex items-center gap-2 border-2 border-foreground px-3 py-2 bg-background">
              <Checkbox
                id="verified-stay-input"
                checked={newVerifiedStay}
                onCheckedChange={(v) => setNewVerifiedStay(!!v)}
                className="border-2 border-foreground"
              />
              <Label htmlFor="verified-stay-input" className="text-sm font-bold cursor-pointer">
                {t("form.verifiedStayLabel")}
              </Label>
            </div>

            {reviewFormError && (
              <p className="text-sm font-bold text-destructive">{reviewFormError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-2 border-foreground"
              onClick={() => handleReviewDialogChange(false)}
              disabled={isSubmittingReview}
            >
              {t("form.cancel")}
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmittingReview}
              className="border-2 border-foreground bg-primary font-bold"
            >
              {isSubmittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmittingReview ? t("form.submitting") : t("form.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
