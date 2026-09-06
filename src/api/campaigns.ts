import { apiRequest } from "./client";
import type { Campaign, CampaignPayload } from "./types";

export const listCampaigns = () => apiRequest<Campaign[]>("/api/v1/hr/campaigns");

export const getCampaign = (id: string) => apiRequest<Campaign>(`/api/v1/hr/campaigns/${id}`);

export const createCampaign = (data: CampaignPayload) =>
  apiRequest<Campaign>("/api/v1/hr/campaigns", { method: "POST", body: data });

export const updateCampaign = (id: string, data: Partial<CampaignPayload>) =>
  apiRequest<Campaign>(`/api/v1/hr/campaigns/${id}`, { method: "PUT", body: data });

export const deleteCampaign = (id: string) =>
  apiRequest<void>(`/api/v1/hr/campaigns/${id}`, { method: "DELETE" });

export const sendInvitations = (id: string) =>
  apiRequest<{ sent: number }>(`/api/v1/hr/campaigns/${id}/invitations`, { method: "POST" });

export const sendReminders = (id: string) =>
  apiRequest<{ sent: number }>(`/api/v1/hr/campaigns/${id}/reminders`, { method: "POST" });
