import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CheckCircle2, FileText, MessagesSquare, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Exit Interview Platform — Structured offboarding feedback" },
      {
        name: "description",
        content:
          "Automate exit interviews, track completion across departments and turn leaver feedback into retention insight for your HR team.",
      },
      { property: "og:title", content: "Exit Interview Platform" },
      {
        property: "og:description",
        content:
          "Automate exit interviews, track completion and turn leaver feedback into retention insight.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Users,
    title: "Employee records",
    body: "Import leavers from Excel, CSV or PDF and keep departments, designations and last working dates in one place.",
  },
  {
    icon: MessagesSquare,
    title: "Guided interviews",
    body: "Employees complete their exit interview from any device, with clear availability windows and reminders.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    body: "Satisfaction, exit reasons, department participation and recurring themes, updated as responses arrive.",
  },
  {
    icon: FileText,
    title: "Reports",
    body: "Generate shareable PDF and Excel summaries for leadership without leaving the platform.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessagesSquare className="size-5" />
          </span>
          <span className="text-sm font-semibold">Exit Interview Platform</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-20">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="size-3.5" /> Enterprise-ready offboarding
          </span>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
            Understand why people leave — before it becomes a pattern
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Run every exit interview through one structured workflow. Invite leavers, track
            completion in real time and hand leadership the insight that actually reduces attrition.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/login">Sign in to your workspace</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/register">Create an account</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["Secure sign-in", "Bulk employee import", "Mobile-friendly for leavers"].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" /> {i}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="panel p-5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <f.icon className="size-5" />
              </span>
              <h2 className="mt-4 text-sm font-semibold text-foreground">{f.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground sm:px-6">
          Exit Interview Platform — structured offboarding feedback for HR teams.
        </div>
      </footer>
    </div>
  );
}
