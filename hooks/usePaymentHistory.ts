"use client";

import { useCallback, useEffect, useState } from "react";
import { getPaymentHistory, type PaymentHistoryItem } from "@/lib/tenantApi";

export interface UsePaymentHistoryParams {
  dealId?: string | null;
  initialPage?: number;
  limit?: number;
}

export function usePaymentHistory({
  dealId,
  initialPage = 1,
  limit = 10,
}: UsePaymentHistoryParams) {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const loadPage = useCallback(
    async (nextPage: number, keepExisting = false) => {
      setIsLoading(true);
      setIsError(false);

      try {
        const response = await getPaymentHistory({
          dealId: dealId ?? undefined,
          page: nextPage,
          limit,
        });

        if (!response.success) {
          throw new Error("Unable to load payment history");
        }

        setPayments((current) =>
          keepExisting ? [...current, ...response.data.payments] : response.data.payments,
        );
        setPage(response.data.page);
        setHasMore(Boolean(response.data.nextPage));
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [dealId, limit],
  );

  useEffect(() => {
    void loadPage(1, false);
  }, [dealId, loadPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore) {
      return;
    }

    const nextPage = page + 1;
    await loadPage(nextPage, true);
  }, [hasMore, loadPage, page]);

  return {
    payments,
    page,
    isLoading,
    isError,
    hasMore,
    loadMore,
  };
}
