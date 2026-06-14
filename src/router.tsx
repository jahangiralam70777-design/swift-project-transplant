import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { isTransientError } from "@/lib/error-classify";
import {
  DefaultErrorFallback,
  DefaultNotFoundFallback,
  DefaultPendingFallback,
} from "./components/route-fallbacks";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Reuse cached data across navigations — keeps page switches instant.
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        // AutoRefreshController owns focus/reconnect/visibility refresh
        // globally (see src/lib/auto-refresh.tsx). Query's own listeners
        // stay off so we don't double-fire when both trigger together.
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Auto-retry only transient failures (network/timeout/5xx/rate-limit).
        // Auth and not-found failures fail fast — retrying won't help.
        retry: (failureCount, error) => failureCount < 2 && isTransientError(error),
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
      mutations: {
        onError: (error) => {
          const { reportError } = require("@/lib/error-reporter");
          reportError({
            source: "frontend",
            severity: "high",
            message: error instanceof Error ? error.message : "Mutation failed",
            payload: { error },
          });
        },
        retry: (failureCount, error) => failureCount < 1 && isTransientError(error),
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 30,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorFallback,
    defaultNotFoundComponent: DefaultNotFoundFallback,
    defaultPendingComponent: DefaultPendingFallback,
    // Never flash a pending UI during navigation — keep the previous page
    // visible until the next route is ready.
    defaultPendingMs: 10_000,
    defaultPendingMinMs: 0,
  });

  return router;
};
