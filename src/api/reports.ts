import { apiDownload, apiRequest } from "./client";
import type { Report } from "./types";

export const listReports = () => apiRequest<Report[]>("/api/v1/hr/reports");

export const getReport = (id: string) => apiRequest<Report>(`/api/v1/hr/reports/${id}`);

export const generateReport = (data: { type: string; format: "PDF" | "EXCEL"; campaign_id?: string }) =>
  apiRequest<Report>("/api/v1/hr/reports/generate", { method: "POST", body: data });

export const downloadReport = (id: string, filename: string) =>
  apiDownload(`/api/v1/hr/reports/${id}/download`, filename);
