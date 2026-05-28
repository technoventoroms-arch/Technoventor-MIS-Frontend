import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiClient,
  normalizeApiError,
  type ApiError,
  type ApiPage,
  type Entity,
} from "@mono/api_client";

export type ResourceState<T> = {
  rows: T[];
  next: string | null;
  previous: string | null;
  isLoading: boolean;
  error: ApiError | null;
  lastUpdatedAt: number | null;
  reload: () => Promise<void>;
  loadNext: () => Promise<void>;
  loadPrevious: () => Promise<void>;
};

export function usePagedResource<T extends Entity>(
  path: string | null,
  orgId?: string | number
): ResourceState<T> {
  const [page, setPage] = useState<ApiPage<T>>({
    next: null,
    previous: null,
    results: [],
  });
  const [pageUrl, setPageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(path));
  const [error, setError] = useState<ApiError | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const load = useCallback(
    async (targetUrl: string | null) => {
      if (!path) {
        setPage({ next: null, previous: null, results: [] });
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const nextPage = await apiClient.list<T>(path, {
          orgId,
          pageUrl: targetUrl,
        });
        setPage(nextPage);
        setPageUrl(targetUrl);
        setLastUpdatedAt(Date.now());
      } catch (loadError) {
        setError(normalizeApiError(loadError));
      } finally {
        setIsLoading(false);
      }
    },
    [orgId, path]
  );

  useEffect(() => {
    void load(null);
  }, [load]);

  useEffect(() => {
    if (!path) return;
    const intervalId = window.setInterval(() => {
      void load(pageUrl);
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [load, pageUrl, path]);

  return useMemo(
    () => ({
      rows: page.results,
      next: page.next,
      previous: page.previous,
      isLoading,
      error,
      lastUpdatedAt,
      reload: () => load(pageUrl),
      loadNext: () => load(page.next),
      loadPrevious: () => load(page.previous),
    }),
    [pageUrl, error, isLoading, lastUpdatedAt, load, page.next, page.previous, page.results]
  );
}
