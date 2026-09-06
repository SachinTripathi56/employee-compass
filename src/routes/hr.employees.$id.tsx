import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, CalendarRange, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { getEmployee } from "@/api/employees";
import { PageHeader } from "@/components/common/PageHeader";
import { ErrorState, LoadingState } from "@/components/common/states";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/hr/employees/$id")({
  head: () => ({
    meta: [
      { title: "Employee details — Exit Interview Platform" },
      { name: "description", content: "Personal, employment and exit interview details for a leaver." },
      { property: "og:title", content: "Employee details — Exit Interview Platform" },
      { property: "og:description", content: "Personal, employment and exit interview details for a leaver." },
    ],
  }),
  component: EmployeeDetailPage,
});

function Field({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: typeof Mail }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        {value || "—"}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function EmployeeDetailPage() {
  const { id } = Route.useParams();
  const query = useQuery({ queryKey: ["hr", "employee", id], queryFn: () => getEmployee(id) });

  if (query.isLoading) return <LoadingState rows={5} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const e = query.data!;

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/hr/employees">
          <ArrowLeft className="size-4" /> Back to employees
        </Link>
      </Button>

      <PageHeader
        title={e.name}
        description={`${e.designation} · ${e.department}`}
        actions={<StatusBadge status={e.interview_status} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Personal information">
          <Field label="Full name" value={e.name} icon={UserRound} />
          <Field label="Email" value={e.email} icon={Mail} />
          <Field label="Phone" value={e.phone} icon={Phone} />
          <Field label="Location" value={e.location} icon={MapPin} />
        </Section>

        <Section title="Employment information">
          <Field label="Employee ID" value={e.employee_id} />
          <Field label="Department" value={e.department} icon={Briefcase} />
          <Field label="Designation" value={e.designation} />
          <Field label="Manager" value={e.manager} />
          <Field label="Joined" value={formatDate(e.join_date)} icon={CalendarRange} />
          <Field label="Last working date" value={formatDate(e.last_working_date)} icon={CalendarRange} />
        </Section>

        <Section title="Interview information">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Interview status
            </p>
            <div className="mt-1.5">
              <StatusBadge status={e.interview_status} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Invitation status
            </p>
            <div className="mt-1.5">
              <StatusBadge status={e.invitation_status} />
            </div>
          </div>
        </Section>

        <Section title="Campaign">
          <Field label="Campaign" value={e.campaign_name} />
          <div className="flex items-end">
            {e.campaign_id && (
              <Button asChild variant="outline" size="sm">
                <Link to="/hr/campaigns/$id" params={{ id: e.campaign_id }}>
                  Open campaign
                </Link>
              </Button>
            )}
          </div>
        </Section>
      </div>
    </>
  );
}
