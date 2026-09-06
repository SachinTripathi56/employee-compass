import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/layout/AuthShell";
import { Button } from "@/components/ui/button";
import { CLERK_ENABLED } from "@/lib/env";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Exit Interview Platform" },
      { name: "description", content: "Reset access to your Exit Interview Platform account." },
      { property: "og:title", content: "Reset your password — Exit Interview Platform" },
      { property: "og:description", content: "Reset access to your Exit Interview Platform account." },
    ],
  }),
  ssr: false,
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Password resets are handled by our secure sign-in provider."
    >
      <p className="text-sm text-muted-foreground">
        {CLERK_ENABLED
          ? "Head back to the sign-in page and choose \u201cForgot password\u201d to receive a reset link by email."
          : "Password resets become available once secure sign-in is connected to this workspace."}
      </p>
      <Button asChild className="mt-6 w-full">
        <Link to="/login">Back to sign in</Link>
      </Button>
    </AuthShell>
  );
}
