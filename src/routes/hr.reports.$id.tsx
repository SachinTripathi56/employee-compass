import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Download } from "lucide-react";
import { downloadReport, getReport } from "@/api/reports";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/hr/reports/$id")({
  head: () => ({
    meta: [
      { title: "Report details — Exit Interview Platform" },
      { name: "description", content: "Review a generated exit interview report and download the file." },
      { property: "og:title", content: "Report details — Exit Interview Platform" },
      { property: "og:description", content: "Review a generated exit interview report and download the file." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportDetailPage,
});

function ReportDetailPage() {
  const { id } = Route.useParams();
  const query = useQuery({ queryKey: ["hr", "report", id], queryFn: () => getReport(id) });

  if (query.isLoading) return <LoadingState rows={4} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const r = query.data!;
  const handleDownload = async () => {
    try {
      await downloadReport(r.id, `${r.name}.${r.format === "EXCEL" ? "xlsx" : "pdf"}`);
    } catch {
      toast.error("Download failed. Please try again.");
    }
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/hr/reports">
          <ArrowLeft className="size-4" /> Back to reports
        </Link>
      </Button>

      <PageHeader
        title={r.name}
        description={`${r.type} · ${r.format}`}
        actions={
          <Button disabled={r.status !== "READY"} onClick={() => void handleDownload()}>
            <Download className="size-4" /> Download
          </Button>
        }
      />

      <section className="panel space-y-3 p-5 text-sm">
        <Row label="Status" value={<StatusBadge status={r.status} />} />
        <Row label="Created" value={formatDateTime(r.created_at)} />
        <Row label="File size" value={r.size ?? "—"} />
        <Row label="Format" value={r.format} />
      </section>

      {r.status !== "READY" && (
        <p className="text-sm text-muted-foreground">
          This report is still being prepared. Refresh in a moment to download it.
        </p>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
