import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Search, Upload, Users } from "lucide-react";
import { listEmployees } from "@/api/employees";
import type { Employee } from "@/api/types";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/hr/employees/")({
  head: () => ({
    meta: [
      { title: "Employees — Exit Interview Platform" },
      { name: "description", content: "Search, filter and manage the leavers in your exit interview programme." },
      { property: "og:title", content: "Employees — Exit Interview Platform" },
      { property: "og:description", content: "Search, filter and manage the leavers in your exit interview programme." },
    ],
  }),
  component: EmployeesPage,
});

const LIMIT = 10;
type SortKey = "name" | "department" | "last_working_date";

function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const query = useQuery({
    queryKey: ["hr", "employees", { search, department, status, page }],
    queryFn: () =>
      listEmployees({
        search: search || undefined,
        department: department === "all" ? undefined : department,
        status: status === "all" ? undefined : status,
        page,
        limit: LIMIT,
      }),
    placeholderData: keepPreviousData,
  });

  const items = useMemo(() => {
    const list: Employee[] = [...(query.data?.items ?? [])];
    list.sort((a, b) => {
      const va = String(a[sortKey] ?? "");
      const vb = String(b[sortKey] ?? "");
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [query.data, sortKey, sortAsc]);

  const total = query.data?.total ?? 0;
  const pages = Math.max(Math.ceil(total / LIMIT), 1);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <>
      <PageHeader
        title="Employees"
        description="Everyone in your offboarding pipeline, with interview and invitation status."
        actions={
          <Button asChild>
            <Link to="/hr/employees/import">
              <Upload className="size-4" /> Import employees
            </Link>
          </Button>
        }
      />

      <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email or employee ID"
            className="pl-9"
          />
        </div>
        <Select
          value={department}
          onValueChange={(v) => {
            setDepartment(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {["Engineering", "Sales", "Marketing", "Finance", "Operations", "People", "Support", "Product"].map(
              (d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Interview status" />
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
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Users className="size-5" />}
          title="No employees have been uploaded yet."
          description="Import a spreadsheet of leavers to start inviting them to exit interviews."
          action={
            <Button asChild size="sm">
              <Link to="/hr/employees/import">Import employees</Link>
            </Button>
          }
        />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort("name")}>
                      Name <ArrowUpDown className="size-3.5" />
                    </button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>
                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort("department")}>
                      Department <ArrowUpDown className="size-3.5" />
                    </button>
                  </TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>
                    <button
                      className="inline-flex items-center gap-1"
                      onClick={() => toggleSort("last_working_date")}
                    >
                      Last working date <ArrowUpDown className="size-3.5" />
                    </button>
                  </TableHead>
                  <TableHead>Interview</TableHead>
                  <TableHead>Invitation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="text-muted-foreground">{e.email}</TableCell>
                    <TableCell className="text-muted-foreground">{e.employee_id}</TableCell>
                    <TableCell>{e.department}</TableCell>
                    <TableCell className="text-muted-foreground">{e.designation}</TableCell>
                    <TableCell>{formatDate(e.last_working_date)}</TableCell>
                    <TableCell>
                      <StatusBadge status={e.interview_status} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={e.invitation_status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/hr/employees/$id" params={{ id: e.id }}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} employees
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
