import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, BellRing, CheckCircle2, Clock, Mail, Users } from "lucide-react";
import { getCampaign, sendInvitations, sendReminders } from "@/api/campaigns";
import { listInterviews } from "@/api/interviews";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/hr/campaigns/$id")({
  head: () => ({
    meta: [
      { title: "Campaign details — Exit Interview Platform" },
      { name: "description", content: "Track invitations, reminders and completion for a single exit interview campaign." },
      { property: "og:title", content: "Campaign details — Exit Interview Platform" },
      { property: "og:description", content: "Track invitations, reminders and completion for a single exit interview campaign." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampaignDetailPage,
});

function CampaignDetailPage() {
  const { id } = Route.useParams();
  const query = useQuery({ queryKey: ["hr", "campaign", id], queryFn: () => getCampaign(id) });
  const interviews = useQuery({ queryKey: ["hr", "interviews"], queryFn: listInterviews });

  const invite = useMutation({
    mutationFn: () => sendInvitations(id),
    onSuccess: (r) => toast.success(`${r.sent} invitations sent`),
    onError: () => toast.error("Invitations could not be sent."),
  });
  const remind = useMutation({
    mutationFn: () => sendReminders(id),
    onSuccess: (r) => toast.success(`${r.sent} reminders sent`),
    onError: () => toast.error("Reminders could not be sent."),
  });

  if (query.isLoading) return <LoadingState rows={5} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const c = query.data!;
  const pct = c.employee_count ? Math.round((c.completed_count / c.employee_count) * 100) : 0;
  const participants = (interviews.data ?? []).filter((i) => i.campaign_id === c.id);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/hr/campaigns">
          <ArrowLeft className="size-4" /> Back to campaigns
        </Link>
      </Button>

      <PageHeader
        title={c.name}
        description={c.description}
        actions={
          <>
            <Button variant="outline" onClick={() => remind.mutate()} disabled={remind.isPending}>
              <BellRing className="size-4" /> {remind.isPending ? "Sending…" : "Send reminders"}
            </Button>
            <Button onClick={() => invite.mutate()} disabled={invite.isPending}>
              <Mail className="size-4" /> {invite.isPending ? "Sending…" : "Send invitations"}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Employees" value={c.employee_count} icon={Users} />
        <StatCard label="Completed" value={c.completed_count} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value={c.pending_count} icon={Clock} tone="warning" />
        <StatCard label="Completion" value={`${pct}%`} icon={CheckCircle2} tone="primary" />
      </div>

      <section className="panel space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Campaign window</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(c.start_at)} → {formatDate(c.end_at)}
            </p>
          </div>
          <StatusBadge status={c.status} />
        </div>
        <Progress value={pct} />
        {c.instructions && (
          <div>
            <p className="text-sm font-semibold">Instructions shown to employees</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.instructions}</p>
          </div>
        )}
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Participants</h2>
          <p className="text-xs text-muted-foreground">Everyone invited under this campaign.</p>
        </div>
        {interviews.isLoading ? (
          <div className="p-5">
            <LoadingState rows={4} />
          </div>
        ) : participants.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No participants have been added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.employee_name}</TableCell>
                    <TableCell className="text-muted-foreground">{i.department}</TableCell>
                    <TableCell>
                      <StatusBadge status={i.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(i.completed_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/hr/interviews/$id" params={{ id: i.id }}>
                          View interview
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </>
  );
}
