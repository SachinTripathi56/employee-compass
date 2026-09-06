import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";

export const Route = createFileRoute("/employee")({
  ssr: false,
  component: EmployeeShell,
});

function EmployeeShell() {
  return (
    <ProtectedRoute role="EMPLOYEE">
      <EmployeeLayout>
        <Outlet />
      </EmployeeLayout>
    </ProtectedRoute>
  );
}
