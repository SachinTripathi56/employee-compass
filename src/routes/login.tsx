import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";
import { Building2, MessagesSquare, UserRound } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/button";
import { CLERK_ENABLED } from "@/lib/env";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Exit Interview Platform" },
      { name: "description", content: "Sign in to manage exit interviews or complete your own." },
      { property: "og:title", content: "Sign in — Exit Interview Platform" },
      { property: "og:description", content: "Sign in to manage exit interviews or complete your own." },
    ],
  }),
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const { isSignedIn, role, demoSignIn, usingDemoAuth } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !role) return;
    navigate({ to: role === "HR" ? "/hr/dashboard" : "/employee/dashboard", replace: true });
  }, [isSignedIn, role, navigate]);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Exit Interview Platform workspace."
    >
      {CLERK_ENABLED ? (
        <SignIn routing="hash" signUpUrl="/register" />
      ) : (
        <div className="space-y-4">
          <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning-foreground">
            Secure sign-in isn't connected yet. Until it is, choose a demo workspace to explore the
            product.
          </p>
          <Button
            className="w-full justify-start"
            size="lg"
            disabled={pending}
            onClick={() => {
              setPending(true);
              demoSignIn("HR");
            }}
          >
            <Building2 className="size-4" /> Continue as HR
          </Button>
          <Button
            className="w-full justify-start"
            size="lg"
            variant="outline"
            disabled={pending}
            onClick={() => {
              setPending(true);
              demoSignIn("EMPLOYEE");
            }}
          >
            <UserRound className="size-4" /> Continue as employee
          </Button>
          {usingDemoAuth && (
            <p className="text-center text-xs text-muted-foreground">
              <MessagesSquare className="mr-1 inline size-3" />
              Demo data only — nothing is saved.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-1 text-center text-sm text-muted-foreground">
        <p>
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Forgot your password?
          </Link>
        </p>
        <p>
          New here?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
