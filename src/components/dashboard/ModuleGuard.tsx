import { Link } from "@tanstack/react-router";
import { Lock, ArrowLeft } from "lucide-react";
import { useModuleVisibility, type ModuleKey } from "@/hooks/use-module-visibility";

/**
 * Wraps a student-facing module page. If an admin has hidden the module via
 * Module Visibility, the page is replaced with a friendly unavailable state
 * so direct links and cached menu items cannot reach disabled features.
 */
export function ModuleGuard({
  moduleKey,
  children,
}: {
  moduleKey: ModuleKey;
  children: React.ReactNode;
}) {
  const { isHidden, isLoading } = useModuleVisibility();

  if (isLoading) return <>{children}</>;
  if (!isHidden(moduleKey)) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="bg-cta-gradient mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-glow">
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="font-display text-2xl font-bold">This section is currently unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your admin has temporarily disabled this module. Please check back later or explore the
        other learning modules from your dashboard.
      </p>
      <Link
        to="/dashboard"
        className="bg-cta-gradient mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
