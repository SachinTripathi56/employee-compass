import { apiRequest } from "./client";
import type { EmployeeInterviewOverview, Interview, InterviewSession } from "./types";

export const listInterviews = () => apiRequest<Interview[]>("/api/v1/hr/interviews");

export const getInterview = (id: string) => apiRequest<Interview>(`/api/v1/hr/interviews/${id}`);

/** Backend decides whether the interview is actually available. */
export const getMyInterview = () =>
  apiRequest<EmployeeInterviewOverview>("/api/v1/employee/interview");

export const getMyInterviewStatus = () =>
  apiRequest<EmployeeInterviewOverview>("/api/v1/employee/interview/status");

export const startMyInterview = () =>
  apiRequest<InterviewSession>("/api/v1/employee/interview/start", { method: "POST" });
