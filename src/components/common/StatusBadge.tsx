import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning-foreground",
  danger: "bg-danger-soft text-destructive",
  info: "bg-primary-soft text-primary",
  neutral: "bg-muted text-muted-foreground",
};

const map: Record<string, { label: string; tone: Tone }> = {
  COMPLETED: { label: "Completed", tone: "success" },
  IN_PROGRESS: { label: "In progress", tone: "info" },
  NOT_STARTED: { label: "Not started", tone: "neutral" },
  EXPIRED: { label: "Expired", tone: "danger" },
  SENT: { label: "Invite sent", tone: "info" },
  OPENED: { label: "Invite opened", tone: "success" },
  NOT_SENT: { label: "Not sent", tone: "neutral" },
  BOUNCED: { label: "Bounced", tone: "danger" },
  DRAFT: { label: "Draft", tone: "neutral" },
  SCHEDULED: { label: "Scheduled", tone: "info" },
  ACTIVE: { label: "Active", tone: "success" },
  QUEUED: { label: "Queued", tone: "neutral" },
  GENERATING: { label: "Generating", tone: "warning" },
  READY: { label: "Ready", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  VALID: { label: "Valid", tone: "success" },
  INVALID: { label: "Invalid", tone: "danger" },
  POSITIVE: { label: "Positive", tone: "success" },
  NEUTRAL: { label: "Neutral", tone: "neutral" },
  NEGATIVE: { label: "Negative", tone: "danger" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const entry = map[status] ?? { label: status, tone: "neutral" as Tone };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        toneClass[entry.tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {entry.label}
    </span>
  );
}
