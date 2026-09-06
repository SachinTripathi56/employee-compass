import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MessagesSquare } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <MessagesSquare className="size-5" />
          </span>
          <span className="text-sm font-semibold">Exit Interview Platform</span>
        </Link>
        <div className="max-w-md">
          <p className="text-2xl leading-snug font-semibold">
            Every departure carries a lesson. Capture it consistently.
          </p>
          <p className="mt-3 text-sm text-sidebar-foreground/70">
            Structured exit interviews, live completion tracking and analytics your leadership team
            can act on.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">
          Your data stays with your organisation.
        </p>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessagesSquare className="size-5" />
            </span>
            <span className="text-sm font-semibold">Exit Interview Platform</span>
          </Link>
          <h1 className="page-title text-foreground">{title}</h1>
          {subtitle && <p className="mt-1.5 mb-6 text-sm text-muted-foreground">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
