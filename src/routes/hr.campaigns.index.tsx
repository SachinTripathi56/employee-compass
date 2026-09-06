import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarRange, Plus } from "lucide-react";
import { listCampaigns } from "@/api/campaigns";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/hr/campaigns/")({
  head: () => ({
    meta: [
      { title: "Campaigns — Exit Interview Platform" },
      { name: "description", content: "Plan, schedule and track exit interview campaigns across departments." },
      { property: "og:title", content: "Campaigns — Exit Interview Platform" },
      { property: "og:description", content: "Plan, schedule and track exit interview campaigns across departments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const query = useQuery({ queryKey: ["hr", "campaigns"], queryFn: listCampaigns });
  const campaigns = query.data ?? [];

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Each campaign invites a group of leavers to their exit interview."
        actions={
          <Button asChild>
            <Link to="/hr/campaigns/new">
              <Plus className="size-4" /> New campaign
            </Link>
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState rows={4} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<CalendarRange className="size-5" />}
          title="No campaigns yet"
          description="Create your first campaign to start inviting employees."
          action={
            <Button asChild size="sm">
              <Link to="/hr/campaigns/new">Create campaign</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {campaigns.map((c) => {
            const pct = c.employee_count ? Math.round((c.completed_count / c.employee_count) * 100) : 0;
            return (
              <article key={c.id} className="panel flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{c.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <p className="text-xs text-muted-foreground">
                  {formatDate(c.start_at)} → {formatDate(c.end_at)}
                </p>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {c.completed_count} of {c.employee_count} completed
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{c.pending_count} pending</span>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/hr/campaigns/$id" params={{ id: c.id }}>
                      View details
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
