import { Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, Wifi, ShieldAlert, Search, Clock, LifeBuoy } from "lucide-react";
import { classifyError, type ErrorKind } from "@/lib/error-classify";

// Instant navigation: never render a pending fallback between routes.
// Previous page stays on screen until the next route is ready (TanStack
// Router default behavior when no pending component is shown).
export function DefaultPendingFallback() {
  return null;
}

export function DefaultNotFoundFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Search className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">We couldn't find that page</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The link may be broken or the page may have moved. Try heading back to the homepage.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

const KIND_ICON: Record<ErrorKind, typeof AlertTriangle> = {
  network: Wifi,
  timeout: Clock,
  auth: ShieldAlert,
  notfound: Search,
  ratelimit: Clock,
  server: AlertTriangle,
  unknown: AlertTriangle,
};

export function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  if (typeof console !== "undefined") {
    // Detailed log for the team; UI shows only the friendly message.
    console.error("[route-error]", error);
  }
  const { kind, title, message } = classifyError(error, "section");
  const Icon = KIND_ICON[kind];

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex min-h-[40vh] items-center justify-center px-4 py-10"
    >
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <Icon className="h-6 w-6 text-destructive" aria-hidden />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" aria-hidden /> Try again
          </button>
          <button
            onClick={() => router.history.back()}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Go back
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Go home
          </Link>
          {(kind === "server" || kind === "unknown") && (
            <a
              href="mailto:support@edumaster.app"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              <LifeBuoy className="h-4 w-4" aria-hidden /> Contact support
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
