import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessagesSquare, Search } from "lucide-react";
import { listInterviews } from "@/api/interviews";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatDuration } from "@/lib/format";

export const Route = createFileRoute("/hr/interviews/")({
  head: () => ({
    meta: [
      { title: "Interviews — Exit Interview Platform" },
      { name: "description", content: "Review every exit interview, its status, duration and outcome." },
      { property: "og:title", content: "Interviews — Exit Interview Platform" },
      { property: "og:description", content: "Review every exit interview, its status, duration and outcome." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InterviewsPage,
});

function InterviewsPage() {
  const query = useQuery({ queryKey: ["hr", "interviews"], queryFn: listInterviews });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [campaign, setCampaign] = useState("all");

  const all = query.data ?? [];
  const campaigns = useMemo(
    () => Array.from(new Map(all.map((i) => [i.campaign_id, i.campaign_name])).entries()),
    [all],
  );

  const rows = all.filter((i) => {
    const q = search.trim().toLowerCase();
    const matches =
      !q || i.employee_name.toLowerCase().includes(q) || i.employee_email.toLowerCase().includes(q);
    return matches && (status === "all" || i.status === status) && (campaign === "all" || i.campaign_id === campaign);
  });

  return (
    <>
      <PageHeader title="Interviews" description="Every exit conversation, with status and outcome." />

      <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name or email"
            className="pl-9"
          />
        </div>
        <Select value={campaign} onValueChange={setCampaign}>
          <SelectTrigger className="sm:w-56">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campaigns</SelectItem>
            {campaigns.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="NOT_STARTED">Not started</SelectItem>
            <SelectItem value="IN_PROGRESS">In progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? (
        <LoadingState rows={6} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare className="size-5" />}
          title="No interviews match these filters"
          description="Try clearing the search or choosing a different campaign."
        />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <span className="block font-medium">{i.employee_name}</span>
                      <span className="block text-xs text-muted-foreground">{i.employee_email}</span>
                    </TableCell>
                    <TableCell>{i.department}</TableCell>
                    <TableCell className="text-muted-foreground">{i.campaign_name}</TableCell>
                    <TableCell>
                      <StatusBadge status={i.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(i.completed_at)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDuration(i.duration_minutes)}</TableCell>
                    <TableCell>{i.satisfaction_score ? i.satisfaction_score.toFixed(1) : "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/hr/interviews/$id" params={{ id: i.id }}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}
