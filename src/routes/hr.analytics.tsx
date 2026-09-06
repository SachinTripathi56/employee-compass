import { useState } from "react";
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
import { Gauge, MessagesSquare, ShieldAlert, TrendingUp } from "lucide-react";
import { getAnalytics } from "@/api/analytics";
import { listCampaigns } from "@/api/campaigns";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CardsLoadingState, ErrorState } from "@/components/common/states";
import { ChartPanel } from "@/components/charts/ChartPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/hr/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Exit Interview Platform" },
      { name: "description", content: "Satisfaction trends, exit reasons, department participation and retention insights." },
      { property: "og:title", content: "Analytics — Exit Interview Platform" },
      { property: "og:description", content: "Satisfaction trends, exit reasons, department participation and retention insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

const COLORS = ["var(--primary)", "var(--success)", "var(--warning)", "var(--destructive)", "var(--accent)"];

function AnalyticsPage() {
  const [campaign, setCampaign] = useState("all");
  const campaigns = useQuery({ queryKey: ["hr", "campaigns"], queryFn: listCampaigns });
  const query = useQuery({
    queryKey: ["hr", "analytics", { campaign }],
    queryFn: () => getAnalytics(campaign === "all" ? {} : { campaign_id: campaign }),
  });

  return (
    <>
      <PageHeader
        title="Analytics"
        description="What people tell you on the way out, turned into patterns."
        actions={
          <Select value={campaign} onValueChange={setCampaign}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Campaign" />
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
        }
      />

      {query.isLoading ? (
        <CardsLoadingState count={4} />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        (() => {
          const a = query.data!;
          return (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Overall satisfaction" value={`${a.overall_satisfaction.toFixed(1)} / 5`} icon={Gauge} tone="primary" />
                <StatCard label="Completion rate" value={`${a.completion_rate}%`} icon={TrendingUp} tone="success" />
                <StatCard label="Total responses" value={a.total_responses} icon={MessagesSquare} />
                <StatCard
                  label="Attrition risk"
                  value={a.attrition_risk_score != null ? `${a.attrition_risk_score}/100` : "—"}
                  icon={ShieldAlert}
                  tone="warning"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <ChartPanel title="Satisfaction trend" description="Average score by period.">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={a.satisfaction_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="period" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis domain={[0, 5]} stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                      <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} dot={false} name="Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Exit reasons" description="Why people said they were leaving.">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={a.exit_reasons} dataKey="count" nameKey="reason" innerRadius={60} outerRadius={100}>
                        {a.exit_reasons.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Department participation" description="Response rate by department.">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={a.department_analysis}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="department" stroke="var(--muted-foreground)" fontSize={11} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                      <Bar dataKey="participation" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Participation %" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Department satisfaction" description="Average score by department.">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={a.department_analysis}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="department" stroke="var(--muted-foreground)" fontSize={11} />
                      <YAxis domain={[0, 5]} stroke="var(--muted-foreground)" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                      <Bar dataKey="satisfaction" fill="var(--success)" radius={[6, 6, 0, 0]} name="Satisfaction" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>
              </div>

              <section className="panel p-5">
                <h2 className="text-sm font-semibold">Common themes</h2>
                <ul className="mt-3 space-y-2">
                  {a.common_themes.map((t) => (
                    <li key={t.theme} className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-sm font-medium">{t.theme}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{t.mentions} mentions</span>
                        <StatusBadge status={t.sentiment} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="panel p-5">
                  <h2 className="text-sm font-semibold">Key insights</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    {a.key_insights.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </section>
                <section className="panel p-5">
                  <h2 className="text-sm font-semibold">Recommendations</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    {a.recommendations.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </>
          );
        })()
      )}
    </>
  );
}
