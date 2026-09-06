import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { CLERK_ENABLED } from "@/lib/env";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create an account — Exit Interview Platform" },
      { name: "description", content: "Create your HR workspace for structured exit interviews." },
      { property: "og:title", content: "Create an account — Exit Interview Platform" },
      { property: "og:description", content: "Create your HR workspace for structured exit interviews." },
    ],
  }),
  ssr: false,
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="Set up your HR workspace in a couple of minutes.">
      {CLERK_ENABLED ? (
        <SignUp routing="hash" signInUrl="/login" />
      ) : (
        <p className="rounded-lg bg-warning-soft px-3 py-3 text-sm text-warning-foreground">
          Account creation opens once secure sign-in is connected. In the meantime you can explore
          the product from the sign-in page.
        </p>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
