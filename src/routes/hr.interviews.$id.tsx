import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Gauge, LogOut } from "lucide-react";
import { getInterview } from "@/api/interviews";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/hr/interviews/$id")({
  head: () => ({
    meta: [
      { title: "Interview details — Exit Interview Platform" },
      { name: "description", content: "Read the full transcript, summary and outcome of an exit interview." },
      { property: "og:title", content: "Interview details — Exit Interview Platform" },
      { property: "og:description", content: "Read the full transcript, summary and outcome of an exit interview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InterviewDetailPage,
});

function InterviewDetailPage() {
  const { id } = Route.useParams();
  const query = useQuery({ queryKey: ["hr", "interview", id], queryFn: () => getInterview(id) });

  if (query.isLoading) return <LoadingState rows={5} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const i = query.data!;
  const transcript = i.transcript ?? [];

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/hr/interviews">
          <ArrowLeft className="size-4" /> Back to interviews
        </Link>
      </Button>

      <PageHeader
        title={i.employee_name}
        description={`${i.department} · ${i.campaign_name}`}
        actions={<StatusBadge status={i.status} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Duration" value={formatDuration(i.duration_minutes)} icon={Clock} />
        <StatCard
          label="Satisfaction"
          value={i.satisfaction_score ? `${i.satisfaction_score.toFixed(1)} / 5` : "—"}
          icon={Gauge}
          tone="primary"
        />
        <StatCard label="Primary exit reason" value={i.exit_reason ?? "—"} icon={LogOut} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="panel p-5">
          <h2 className="text-sm font-semibold">Transcript</h2>
          {transcript.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No transcript yet — it appears once the interview is completed.
            </p>
          ) : (
            <ol className="mt-4 space-y-4">
              {transcript.map((t, idx) => (
                <li key={idx} className="flex gap-3">
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full",
                      t.role === "INTERVIEWER" ? "bg-primary" : "bg-success",
                    )}
                  />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {t.role === "INTERVIEWER" ? "Interviewer" : i.employee_name}
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">{t.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="space-y-4">
          <section className="panel p-5">
            <h2 className="text-sm font-semibold">Summary</h2>
            <p className="mt-2 text-sm text-muted-foreground">{i.summary ?? "No summary available yet."}</p>
          </section>
          <section className="panel space-y-3 p-5 text-sm">
            <h2 className="text-sm font-semibold">Details</h2>
            <Detail label="Email" value={i.employee_email} />
            <Detail label="Started" value={formatDateTime(i.started_at)} />
            <Detail label="Completed" value={formatDateTime(i.completed_at)} />
            <Detail label="Campaign" value={i.campaign_name} />
          </section>
        </aside>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
