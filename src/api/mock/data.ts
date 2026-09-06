/**
 * DEMO DATA ONLY.
 * Used while VITE_API_BASE_URL is not configured.
 * Delete this folder once the FastAPI backend is connected.
 */
import type {
  AnalyticsResponse,
  Campaign,
  CurrentUser,
  Employee,
  EmployeeInterviewOverview,
  HrDashboardMetrics,
  ImportResult,
  Interview,
  Report,
} from "../types";

export const mockHrUser: CurrentUser = {
  id: "usr_hr_1",
  clerk_user_id: "clerk_demo_hr",
  role: "HR",
  company_id: "cmp_1",
  name: "Ananya Sharma",
  email: "ananya@northwind.com",
};

export const mockEmployeeUser: CurrentUser = {
  id: "usr_emp_1",
  clerk_user_id: "clerk_demo_emp",
  role: "EMPLOYEE",
  company_id: "cmp_1",
  name: "Rahul Verma",
  email: "rahul@northwind.com",
};

const departments = ["Engineering", "Sales", "Marketing", "Finance", "Support", "People Ops"];
const designations = ["Analyst", "Manager", "Senior Engineer", "Team Lead", "Associate", "Director"];
const statuses = ["COMPLETED", "IN_PROGRESS", "NOT_STARTED", "EXPIRED"] as const;
const invites = ["SENT", "OPENED", "NOT_SENT", "BOUNCED"] as const;
const names = [
  "Rahul Verma","Priya Nair","Arjun Mehta","Sara Khan","Vikram Rao","Neha Gupta","Aditya Jain",
  "Meera Iyer","Karan Malhotra","Divya Pillai","Rohit Sinha","Ishita Bose","Nikhil Chawla",
  "Tara Menon","Sameer Kulkarni","Aisha Sheikh","Manish Dubey","Kavya Reddy","Farhan Ali",
  "Sneha Joshi","Gaurav Bhatt","Ritu Saxena","Dev Patel","Ayesha Rahman","Harsh Vardhan",
  "Pooja Deshmukh","Anil Kapoor","Lakshmi Krishnan","Varun Sethi","Nandini Rao",
];

export const mockEmployees: Employee[] = names.map((name, i) => ({
  id: `emp_${i + 1}`,
  name,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@northwind.com`,
  employee_id: `NW-${1000 + i}`,
  department: departments[i % departments.length]!,
  designation: designations[i % designations.length]!,
  last_working_date: `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
  interview_status: statuses[i % statuses.length]!,
  invitation_status: invites[i % invites.length]!,
  phone: `+91 98${String(10000000 + i * 137).slice(0, 8)}`,
  location: ["Bengaluru", "Mumbai", "Pune", "Remote"][i % 4]!,
  manager: names[(i + 7) % names.length]!,
  join_date: `202${(i % 4) + 1}-0${(i % 9) + 1}-12`,
  campaign_id: i % 3 === 0 ? "camp_1" : "camp_2",
  campaign_name: i % 3 === 0 ? "May 2026 Exit Interviews" : "Q2 Voluntary Exits",
}));

export const mockDashboard: HrDashboardMetrics = {
  total_employees: 120,
  total_interviews: 100,
  completed_interviews: 72,
  pending_interviews: 28,
  expired_interviews: 10,
  completion_rate: 72,
  active_campaigns: 3,
};

export const mockCampaigns: Campaign[] = [
  {
    id: "camp_1",
    name: "May 2026 Exit Interviews",
    description: "Monthly exit interview cycle for all departing employees.",
    start_at: "2026-05-01T09:00:00Z",
    end_at: "2026-05-15T18:00:00Z",
    status: "ACTIVE",
    instructions: "Please complete your exit interview before your last working day.",
    employee_count: 42,
    completed_count: 30,
    pending_count: 12,
  },
  {
    id: "camp_2",
    name: "Q2 Voluntary Exits",
    description: "Focused campaign for voluntary resignations in Q2.",
    start_at: "2026-04-01T09:00:00Z",
    end_at: "2026-06-30T18:00:00Z",
    status: "SCHEDULED",
    instructions: "Takes about 15 minutes. Your answers stay confidential.",
    employee_count: 28,
    completed_count: 9,
    pending_count: 19,
  },
  {
    id: "camp_3",
    name: "March 2026 Exit Interviews",
    description: "Closed cycle, archived for reporting.",
    start_at: "2026-03-01T09:00:00Z",
    end_at: "2026-03-20T18:00:00Z",
    status: "COMPLETED",
    employee_count: 30,
    completed_count: 27,
    pending_count: 0,
  },
];

export const mockInterviews: Interview[] = mockEmployees.slice(0, 18).map((e, i) => ({
  id: `int_${i + 1}`,
  employee_id: e.id,
  employee_name: e.name,
  employee_email: e.email,
  department: e.department,
  campaign_id: e.campaign_id ?? "camp_1",
  campaign_name: e.campaign_name ?? "May 2026 Exit Interviews",
  status: e.interview_status,
  started_at: e.interview_status === "NOT_STARTED" ? null : "2026-05-04T10:12:00Z",
  completed_at: e.interview_status === "COMPLETED" ? "2026-05-04T10:38:00Z" : null,
  duration_minutes: e.interview_status === "COMPLETED" ? 18 + (i % 12) : null,
  satisfaction_score: e.interview_status === "COMPLETED" ? 3 + ((i % 5) * 0.4) : null,
  exit_reason: e.interview_status === "COMPLETED"
    ? ["Better compensation", "Career growth", "Manager relationship", "Relocation", "Work-life balance"][i % 5]!
    : null,
  summary:
    e.interview_status === "COMPLETED"
      ? "Employee reported a positive team experience but limited growth visibility and below-market compensation."
      : null,
  transcript:
    e.interview_status === "COMPLETED"
      ? [
          { role: "INTERVIEWER", text: "What prompted you to start looking for a new role?" },
          { role: "EMPLOYEE", text: "Mainly growth. I stayed in the same scope for two years." },
          { role: "INTERVIEWER", text: "How would you describe your manager relationship?" },
          { role: "EMPLOYEE", text: "Supportive day to day, but career conversations were rare." },
        ]
      : [],
}));

export const mockAnalytics: AnalyticsResponse = {
  overall_satisfaction: 3.8,
  completion_rate: 72,
  total_responses: 72,
  attrition_risk_score: 62,
  department_analysis: departments.map((d, i) => ({
    department: d,
    participation: 55 + ((i * 13) % 40),
    satisfaction: 3 + ((i * 7) % 20) / 10,
  })),
  exit_reasons: [
    { reason: "Better compensation", count: 24, percentage: 33 },
    { reason: "Career growth", count: 18, percentage: 25 },
    { reason: "Manager relationship", count: 12, percentage: 17 },
    { reason: "Work-life balance", count: 10, percentage: 14 },
    { reason: "Relocation", count: 8, percentage: 11 },
  ],
  common_themes: [
    { theme: "Limited growth paths", mentions: 31, sentiment: "NEGATIVE" },
    { theme: "Strong team culture", mentions: 27, sentiment: "POSITIVE" },
    { theme: "Compensation vs market", mentions: 22, sentiment: "NEGATIVE" },
    { theme: "Flexible working", mentions: 15, sentiment: "POSITIVE" },
    { theme: "Unclear expectations", mentions: 11, sentiment: "NEUTRAL" },
  ],
  satisfaction_trend: [
    { period: "Dec", score: 3.4 },
    { period: "Jan", score: 3.5 },
    { period: "Feb", score: 3.3 },
    { period: "Mar", score: 3.7 },
    { period: "Apr", score: 3.9 },
    { period: "May", score: 3.8 },
  ],
  key_insights: [
    "One in three exits cites compensation as the primary driver.",
    "Engineering has the highest participation but the lowest satisfaction score.",
    "Employees with under 18 months tenure leave for growth, not pay.",
  ],
  recommendations: [
    "Run a market compensation benchmark for Engineering and Sales.",
    "Introduce quarterly career conversations with documented growth plans.",
    "Train managers on retention conversations before notice periods start.",
  ],
};

export const mockReports: Report[] = [
  { id: "rep_1", name: "May 2026 Exit Summary", type: "Campaign Summary", format: "PDF", status: "READY", created_at: "2026-05-16T08:00:00Z", size: "1.2 MB" },
  { id: "rep_2", name: "Q2 Department Breakdown", type: "Analytics", format: "EXCEL", status: "READY", created_at: "2026-05-10T08:00:00Z", size: "480 KB" },
  { id: "rep_3", name: "Attrition Risk Review", type: "Insights", format: "PDF", status: "GENERATING", created_at: "2026-05-18T08:00:00Z" },
];

export const mockImportResult: ImportResult = {
  import_id: "imp_demo_1",
  total_rows: 8,
  valid_rows: 6,
  invalid_rows: 2,
  rows: [
    { row: 1, name: "Aarav Shah", email: "aarav@northwind.com", employee_id: "NW-2001", department: "Engineering", designation: "Engineer", last_working_date: "2026-06-12", status: "VALID" },
    { row: 2, name: "Bhavna Rao", email: "bhavna@northwind.com", employee_id: "NW-2002", department: "Sales", designation: "Manager", last_working_date: "2026-06-14", status: "VALID" },
    { row: 3, name: "Chetan Kumar", email: "not-an-email", employee_id: "NW-2003", department: "Finance", designation: "Analyst", last_working_date: "2026-06-20", status: "INVALID", error: "Invalid email address" },
    { row: 4, name: "Deepa Nair", email: "deepa@northwind.com", employee_id: "NW-2004", department: "Support", designation: "Associate", last_working_date: "2026-06-22", status: "VALID" },
    { row: 5, name: "", email: "eshan@northwind.com", employee_id: "NW-2005", department: "Marketing", designation: "Executive", last_working_date: "2026-07-01", status: "INVALID", error: "Name is required" },
    { row: 6, name: "Farah Qureshi", email: "farah@northwind.com", employee_id: "NW-2006", department: "People Ops", designation: "Partner", last_working_date: "2026-07-03", status: "VALID" },
    { row: 7, name: "Gaurav Nanda", email: "gaurav@northwind.com", employee_id: "NW-2007", department: "Engineering", designation: "Team Lead", last_working_date: "2026-07-05", status: "VALID" },
    { row: 8, name: "Hina Sethi", email: "hina@northwind.com", employee_id: "NW-2008", department: "Sales", designation: "Associate", last_working_date: "2026-07-09", status: "VALID" },
  ],
};

export const mockEmployeeOverview: EmployeeInterviewOverview = {
  employee_name: "Rahul Verma",
  company_name: "Northwind Technologies",
  campaign_name: "May 2026 Exit Interviews",
  available_from: "2026-05-01T09:00:00Z",
  available_to: "2026-05-15T18:00:00Z",
  instructions:
    "This interview takes about 15 minutes. Answer openly — your responses are shared with HR as aggregated insights.",
  status: "NOT_STARTED",
  interview_id: "int_demo_1",
};
