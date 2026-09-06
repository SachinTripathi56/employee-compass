import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, FileText, Plus } from "lucide-react";
import { downloadReport, generateReport, listReports } from "@/api/reports";
import { listCampaigns } from "@/api/campaigns";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/hr/reports/")({
  head: () => ({
    meta: [
      { title: "Reports — Exit Interview Platform" },
      { name: "description", content: "Generate and download exit interview summaries in PDF or Excel." },
      { property: "og:title", content: "Reports — Exit Interview Platform" },
      { property: "og:description", content: "Generate and download exit interview summaries in PDF or Excel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["hr", "reports"], queryFn: listReports });
  const campaigns = useQuery({ queryKey: ["hr", "campaigns"], queryFn: listCampaigns });

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("Campaign Summary");
  const [format, setFormat] = useState<"PDF" | "EXCEL">("PDF");
  const [campaign, setCampaign] = useState("all");

  const generate = useMutation({
    mutationFn: () =>
      generateReport({ type, format, ...(campaign === "all" ? {} : { campaign_id: campaign }) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hr", "reports"] });
      setOpen(false);
      toast.success("Report is being generated");
    },
    onError: () => toast.error("The report could not be generated."),
  });

  const download = async (id: string, name: string, fmt: string) => {
    try {
      await downloadReport(id, `${name}.${fmt === "EXCEL" ? "xlsx" : "pdf"}`);
    } catch {
      toast.error("Download failed. Please try again.");
    }
  };

  const reports = query.data ?? [];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Shareable summaries of your exit interview data."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Generate report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate a report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Report type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Campaign Summary">Campaign summary</SelectItem>
                      <SelectItem value="Analytics">Analytics breakdown</SelectItem>
                      <SelectItem value="Insights">Insights and recommendations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Campaign</Label>
                  <Select value={campaign} onValueChange={setCampaign}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All campaigns</SelectItem>
                      {(campaigns.data ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={format} onValueChange={(v) => setFormat(v as "PDF" | "EXCEL")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="EXCEL">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
                  {generate.isPending ? "Generating…" : "Generate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {query.isLoading ? (
        <LoadingState rows={4} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" />}
          title="No reports yet"
          description="Generate your first report to share exit interview findings."
        />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.type}</TableCell>
                    <TableCell>{r.format}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(r.created_at)}</TableCell>
                    <TableCell className="text-muted-foreground">{r.size ?? "—"}</TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/hr/reports/$id" params={{ id: r.id }}>
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={r.status !== "READY"}
                        onClick={() => void download(r.id, r.name, r.format)}
                      >
                        <Download className="size-4" /> Download
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
