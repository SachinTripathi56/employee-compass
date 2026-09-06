import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { confirmImport, importEmployees } from "@/api/employees";
import type { ImportResult } from "@/api/types";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState } from "@/components/common/states";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/hr/employees/import")({
  head: () => ({
    meta: [
      { title: "Import employees — Exit Interview Platform" },
      { name: "description", content: "Upload an Excel, CSV or PDF file of leavers and review validation results." },
      { property: "og:title", content: "Import employees — Exit Interview Platform" },
      { property: "og:description", content: "Upload an Excel, CSV or PDF file of leavers and review validation results." },
    ],
  }),
  component: ImportPage,
});

const ACCEPT = ".xlsx,.xls,.csv,.pdf";

function ImportPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const upload = useMutation({
    mutationFn: (f: File) => importEmployees(f),
    onSuccess: (data) => setResult(data),
  });

  const confirm = useMutation({
    mutationFn: (importId: string) => confirmImport(importId),
    onSuccess: () => {
      toast.success("Import confirmed. Employees are being added.");
      navigate({ to: "/hr/employees" });
    },
    onError: () => toast.error("We couldn't confirm this import. Please try again."),
  });

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setResult(null);
    setFile(f);
    upload.mutate(f);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    upload.reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/hr/employees">
          <ArrowLeft className="size-4" /> Back to employees
        </Link>
      </Button>

      <PageHeader
        title="Upload employee data"
        description="Excel, CSV or PDF. Your file is checked on the server and nothing is added until you confirm."
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "panel flex flex-col items-center justify-center gap-3 border-2 border-dashed p-12 text-center transition-colors",
          dragging ? "border-primary bg-primary-soft/60" : "border-border",
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <UploadCloud className="size-6" />
        </span>
        <p className="text-sm font-semibold text-foreground">Drag & drop your file here</p>
        <p className="text-sm text-muted-foreground">Supported formats: .xlsx, .xls, .csv, .pdf</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
        />
        <Button className="mt-1" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
          Choose file
        </Button>
      </div>

      {file && (
        <div className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <FileSpreadsheet className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.name.split(".").pop() ?? "").toUpperCase()} · {(file.size / 1024).toFixed(0)} KB
            </p>
            {upload.isPending && (
              <div className="mt-2">
                <Progress value={70} className="h-1.5" />
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" /> Uploading and validating…
                </p>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={reset} disabled={upload.isPending}>
            Re-upload
          </Button>
        </div>
      )}

      {upload.isError && <ErrorState error={upload.error} onRetry={() => file && upload.mutate(file)} />}

      {result && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="panel p-5">
              <p className="text-sm text-muted-foreground">Total rows</p>
              <p className="mt-1 text-2xl font-semibold">{result.total_rows}</p>
            </div>
            <div className="panel p-5">
              <p className="flex items-center gap-1.5 text-sm text-success">
                <CheckCircle2 className="size-4" /> Valid rows
              </p>
              <p className="mt-1 text-2xl font-semibold">{result.valid_rows}</p>
            </div>
            <div className="panel p-5">
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertTriangle className="size-4" /> Invalid rows
              </p>
              <p className="mt-1 text-2xl font-semibold">{result.invalid_rows}</p>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Last working date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(result.rows ?? []).map((r) => (
                    <TableRow
                      key={r.row}
                      className={cn(r.status === "INVALID" && "bg-danger-soft/50")}
                    >
                      <TableCell className="font-medium">{r.name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{r.employee_id || "—"}</TableCell>
                      <TableCell>{r.department || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{r.designation || "—"}</TableCell>
                      <TableCell>{r.last_working_date ? formatDate(r.last_working_date) : "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-sm text-destructive">{r.error ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={reset}>
              Fix and re-upload
            </Button>
            <Button
              onClick={() => confirm.mutate(result.import_id)}
              disabled={confirm.isPending || result.valid_rows === 0}
            >
              {confirm.isPending && <Loader2 className="size-4 animate-spin" />}
              Confirm import ({result.valid_rows})
            </Button>
          </div>
        </>
      )}
    </>
  );
}
