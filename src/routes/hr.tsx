import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { HrLayout } from "@/components/layout/HrLayout";

export const Route = createFileRoute("/hr")({
  ssr: false,
  component: HrShell,
});

function HrShell() {
  return (
    <ProtectedRoute role="HR">
      <HrLayout>
        <Outlet />
      </HrLayout>
    </ProtectedRoute>
  );
}
