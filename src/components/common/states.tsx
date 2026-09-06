import type { ReactNode } from "react";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/api/client";

export function LoadingState({ rows = 4, label }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-label={label ?? "Loading"}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function CardsLoadingState({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Something went wrong. Please try again.";
  return (
    <div className="panel flex flex-col items-center gap-3 p-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-danger-soft text-destructive">
        <AlertCircle className="size-5" />
      </span>
      <p className="text-sm font-medium text-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-center gap-3 p-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
        {icon ?? <Inbox className="size-5" />}
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
