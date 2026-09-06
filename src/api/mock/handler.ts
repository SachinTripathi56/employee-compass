/**
 * DEMO MODE ONLY — resolves API calls locally when VITE_API_BASE_URL is unset.
 * Remove this file (and src/api/mock/data.ts) once FastAPI is connected.
 */
import {
  mockAnalytics,
  mockCampaigns,
  mockDashboard,
  mockEmployeeOverview,
  mockEmployees,
  mockHrUser,
  mockEmployeeUser,
  mockImportResult,
  mockInterviews,
  mockReports,
} from "./data";
import type { Employee } from "../types";

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export function getDemoRole(): "HR" | "EMPLOYEE" {
  if (typeof window === "undefined") return "HR";
  return (localStorage.getItem("demo_role") as "HR" | "EMPLOYEE") ?? "HR";
}

export function setDemoRole(role: "HR" | "EMPLOYEE") {
  localStorage.setItem("demo_role", role);
}

export async function mockRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  await delay();
  const [rawPath, rawQuery] = path.split("?");
  const p = rawPath ?? "";
  const q = new URLSearchParams(rawQuery ?? "");
  const out = (v: unknown) => v as T;

  if (p === "/api/v1/me") {
    return out(getDemoRole() === "HR" ? mockHrUser : mockEmployeeUser);
  }
  if (p === "/api/v1/hr/dashboard") return out(mockDashboard);

  if (p === "/api/v1/hr/employees" && method === "GET") {
    const search = (q.get("search") ?? "").toLowerCase();
    const dept = q.get("department") ?? "";
    const status = q.get("status") ?? "";
    const page = Number(q.get("page") ?? 1);
    const limit = Number(q.get("limit") ?? 10);
    let items: Employee[] = mockEmployees.filter((e) => {
      const matches =
        !search ||
        e.name.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.employee_id.toLowerCase().includes(search);
      return matches && (!dept || e.department === dept) && (!status || e.interview_status === status);
    });
    const total = items.length;
    items = items.slice((page - 1) * limit, page * limit);
    return out({ items, total, page, limit });
  }
  if (p.startsWith("/api/v1/hr/employees/imports/")) {
    return out(mockImportResult);
  }
  if (p === "/api/v1/hr/employees/import") return out(mockImportResult);
  if (p.startsWith("/api/v1/hr/employees/") && method === "GET") {
    const id = p.split("/").pop();
    const found = mockEmployees.find((e) => e.id === id) ?? mockEmployees[0];
    return out(found);
  }
  if (p.startsWith("/api/v1/hr/employees")) return out(body ?? { ok: true });

  if (p === "/api/v1/hr/campaigns" && method === "GET") return out(mockCampaigns);
  if (p === "/api/v1/hr/campaigns" && method === "POST") {
    return out({ ...mockCampaigns[0], ...(body as object), id: `camp_${Date.now()}`, status: "SCHEDULED" });
  }
  if (p.startsWith("/api/v1/hr/campaigns/") && p.endsWith("/invitations")) return out({ sent: 12 });
  if (p.startsWith("/api/v1/hr/campaigns/") && p.endsWith("/reminders")) return out({ sent: 7 });
  if (p.startsWith("/api/v1/hr/campaigns/")) {
    const id = p.split("/")[5];
    return out(mockCampaigns.find((c) => c.id === id) ?? mockCampaigns[0]);
  }

  if (p === "/api/v1/hr/interviews") return out(mockInterviews);
  if (p.startsWith("/api/v1/hr/interviews/")) {
    const id = p.split("/").pop();
    return out(mockInterviews.find((i) => i.id === id) ?? mockInterviews[0]);
  }

  if (p === "/api/v1/employee/interview" || p === "/api/v1/employee/interview/status") {
    return out(mockEmployeeOverview);
  }
  if (p === "/api/v1/employee/interview/start") {
    return out({
      interview_id: "int_demo_1",
      session_id: `sess_${Date.now()}`,
      status: "IN_PROGRESS",
      interview_url: null,
      mode: "EMBED",
    });
  }

  if (p === "/api/v1/hr/analytics") return out(mockAnalytics);

  if (p === "/api/v1/hr/reports" && method === "GET") return out(mockReports);
  if (p === "/api/v1/hr/reports/generate") {
    return out({
      id: `rep_${Date.now()}`,
      name: "New Report",
      type: "Campaign Summary",
      format: "PDF",
      status: "GENERATING",
      created_at: new Date().toISOString(),
    });
  }
  if (p.startsWith("/api/v1/hr/reports/")) {
    const id = p.split("/")[5];
    return out(mockReports.find((r) => r.id === id) ?? mockReports[0]);
  }

  return out({} as T);
}
