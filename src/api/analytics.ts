import { apiRequest } from "./client";
import type { AnalyticsResponse } from "./types";

export const getAnalytics = (params: { campaign_id?: string; department?: string } = {}) =>
  apiRequest<AnalyticsResponse>("/api/v1/hr/analytics", { query: { ...params } });
