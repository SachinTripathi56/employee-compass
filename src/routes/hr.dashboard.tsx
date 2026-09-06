import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarRange,
  CheckCircle2,
  Clock,
  MessagesSquare,
  TimerOff,
  TrendingUp,
  Users,
} from "lucide-react";
import { getHrDashboard } from "@/api/dashboard";
import { getAnalytics } from "@/api/analytics";
import { listCampaigns } from "@/api/campaigns";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { CardsLoadingState, ErrorState } from "@/components/common/states";
import { ChartPanel } from "@/components/charts/ChartPanel";

export const Route = createFileRoute("/hr/dashboard")({
  head: () => ({
    meta: [
      { title: "HR dashboard — Exit Interview Platform" },
      { name: "description", content: "Live exit interview participation, completion and satisfaction metrics." },
      { property: "og:title", content: "HR dashboard — Exit Interview Platform" },
      { property: "og:description", content: "Live exit interview participation, completion and satisfaction metrics." },
    ],
  }),
  component: DashboardPage,
});

const PIE_COLORS = ["var(--success)", "var(--primary)", "var(--warning)", "var(--destructive)"];

function DashboardPage() {
  const metrics = useQuery({ queryKey: ["hr", "dashboard"], queryFn: getHrDashboard });
  const analytics = useQuery({ queryKey: ["hr", "analytics", {}], queryFn: () => getAnalytics() });
  const campaigns = useQuery({ queryKey: ["hr", "campaigns"], queryFn: listCampaigns });

  if (metrics.isLoading) {
    return (
      <>
        <PageHeader title="Dashboard" description="Exit interview activity across your company." />
        <CardsLoadingState count={6} />
      </>
    );
  }
  if (metrics.isError) return <ErrorState error={metrics.error} onRetry={() => void metrics.refetch()} />;

  const d = metrics.data!;
  const activeCampaigns =
    d.active_campaigns ?? (campaigns.data ?? []).filter((c) => c.status === "ACTIVE").length;

  const statusData = [
    { name: "Completed", value: d.completed_interviews },
    { name: "In progress", value: Math.max(d.total_interviews - d.completed_interviews - d.pending_interviews - d.expired_interviews, 0) },
    { name: "Pending", value: d.pending_interviews },
    { name: "Expired", value: d.expired_interviews },
  ];

  const departments = analytics.data?.department_analysis ?? [];
  const trend = analytics.data?.satisfaction_trend ?? [];
  const reasons = analytics.data?.exit_reasons ?? [];

  return (
    <>
      <PageHeader title="Dashboard" description="Exit interview activity across your company." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total employees" value={d.total_employees} icon={Users} />
        <StatCard label="Active campaigns" value={activeCampaigns} icon={CalendarRange} tone="primary" />
        <StatCard label="Total interviews" value={d.total_interviews} icon={MessagesSquare} />
        <StatCard label="Completed" value={d.completed_interviews} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value={d.pending_interviews} icon={Clock} tone="warning" />
        <StatCard label="Expired" value={d.expired_interviews} icon={TimerOff} tone="danger" />
        <StatCard
          label="Completion rate"
          value={`${d.completion_rate.toFixed(1)}%`}
          icon={TrendingUp}
          tone="success"
          hint="Completed vs. invited"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Interview completion" description="Satisfaction and completion trend over recent periods.">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="period" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} dot={false} name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Interview status" description="Where every invited interview currently stands.">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Department participation" description="Share of leavers who completed their interview.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departments}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="department" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Legend />
              <Bar dataKey="participation" name="Participation %" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="satisfaction" name="Satisfaction" fill="var(--success)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Exit reasons" description="Most common reasons people gave for leaving.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reasons} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis type="category" dataKey="reason" width={140} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Bar dataKey="count" name="Responses" fill="var(--primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </>
  );
}
