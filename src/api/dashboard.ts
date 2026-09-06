import { apiRequest } from "./client";
import type { HrDashboardMetrics } from "./types";

export const getHrDashboard = () => apiRequest<HrDashboardMetrics>("/api/v1/hr/dashboard");
