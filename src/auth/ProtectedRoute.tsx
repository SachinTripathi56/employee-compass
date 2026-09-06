import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/api/types";

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/**
 * UI-level gate only. The FastAPI backend remains the source of truth for
 * authorization — every request is re-authorized server side.
 */
export function ProtectedRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { isLoaded, isSignedIn, role: actualRole, isProfileLoading, profileError, signOut } =
    useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) navigate({ to: "/login", replace: true });
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    if (!actualRole || actualRole === role) return;
    navigate({ to: actualRole === "HR" ? "/hr/dashboard" : "/employee/dashboard", replace: true });
  }, [actualRole, role, navigate]);

  if (!isLoaded) return <FullScreenLoader label="Checking your session…" />;
  if (!isSignedIn) return <FullScreenLoader label="Redirecting to sign in…" />;
  if (isProfileLoading) return <FullScreenLoader label="Loading your workspace…" />;

  if (profileError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="panel max-w-md p-8 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-danger-soft text-destructive">
            <ShieldAlert className="size-5" />
          </span>
          <h1 className="mt-4 text-lg font-semibold">We couldn't load your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in, but the service didn't confirm your access. Please try again
            or sign in with a different account.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button onClick={() => window.location.reload()}>Try again</Button>
            <Button variant="outline" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!actualRole) return <FullScreenLoader label="Loading your workspace…" />;
  if (actualRole !== role) return <FullScreenLoader label="Taking you to the right place…" />;

  return <>{children}</>;
}
