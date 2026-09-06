/** TypeScript models mirroring the FastAPI backend contract (/api/v1/...). */

export type UserRole = "HR" | "EMPLOYEE";

export interface CurrentUser {
  id: string;
  clerk_user_id: string;
  role: UserRole;
  company_id: string;
  name: string;
  email: string;
}

export interface HrDashboardMetrics {
  total_employees: number;
  total_interviews: number;
  completed_interviews: number;
  pending_interviews: number;
  expired_interviews: number;
  completion_rate: number;
  active_campaigns?: number;
}

export type InterviewStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "EXPIRED";

export type InvitationStatus = "NOT_SENT" | "SENT" | "OPENED" | "BOUNCED";

export interface Employee {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  designation: string;
  last_working_date: string;
  interview_status: InterviewStatus;
  invitation_status: InvitationStatus;
  phone?: string;
  location?: string;
  manager?: string;
  join_date?: string;
  campaign_id?: string | null;
  campaign_name?: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeQuery {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ImportRowError {
  row: number;
  field: string;
  message: string;
}

export interface ImportRow {
  row: number;
  name: string;
  email: string;
  employee_id: string;
  department: string;
  designation: string;
  last_working_date: string;
  status: "VALID" | "INVALID";
  error?: string;
}

export interface ImportResult {
  import_id: string;
  file_name?: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  rows?: ImportRow[];
  errors?: ImportRowError[];
}

export type CampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "COMPLETED"
  | "EXPIRED";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  status: CampaignStatus;
  instructions?: string;
  employee_ids?: string[];
  employee_count: number;
  completed_count: number;
  pending_count: number;
}

export interface CampaignPayload {
  name: string;
  description: string;
  start_at: string;
  end_at: string;
  instructions?: string;
  employee_ids?: string[];
}

export interface Interview {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  department: string;
  campaign_id: string;
  campaign_name: string;
  status: InterviewStatus;
  started_at?: string | null;
  completed_at?: string | null;
  duration_minutes?: number | null;
  satisfaction_score?: number | null;
  exit_reason?: string | null;
  summary?: string | null;
  transcript?: { role: "INTERVIEWER" | "EMPLOYEE"; text: string; at?: string }[];
}

export interface EmployeeInterviewOverview {
  employee_name: string;
  company_name: string;
  campaign_name: string;
  available_from: string;
  available_to: string;
  instructions: string;
  status: InterviewStatus;
  interview_id?: string | null;
}

export interface InterviewSession {
  interview_id: string;
  session_id: string;
  status: InterviewStatus;
  interview_url?: string | null;
  mode?: "EMBED" | "REDIRECT" | "TOKEN";
}

export interface AnalyticsResponse {
  overall_satisfaction: number;
  completion_rate: number;
  total_responses: number;
  attrition_risk_score?: number;
  department_analysis: { department: string; participation: number; satisfaction: number }[];
  exit_reasons: { reason: string; count: number; percentage: number }[];
  common_themes: { theme: string; mentions: number; sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE" }[];
  satisfaction_trend: { period: string; score: number }[];
  key_insights: string[];
  recommendations: string[];
}

export type ReportStatus = "QUEUED" | "GENERATING" | "READY" | "FAILED";

export interface Report {
  id: string;
  name: string;
  type: string;
  format: "PDF" | "EXCEL";
  status: ReportStatus;
  created_at: string;
  size?: string;
  download_url?: string | null;
}
