import { User } from "./user";

export type ReportStatus = "Draft" | "Submitted" | "Needs Correction" | "Approved";
export type TaskType = "Development" | "Testing" | "Meetings" | "Documentation";
export type TaskStatus = "Not Started" | "In Progress" | "Completed" | "Blocked";
export type TaskPriority = "Low" | "Medium" | "High" | "Critical";

export interface ReportTask {
  id?: number;
  report_id?: number;
  created_at?: string;
  task_name?: string;
  priority?: TaskPriority;
  planned_percentage?: number;
  actual_percentage?: number;
  status?: TaskStatus;
  time_planned_hours?: number;
  time_spent_hours?: number;
  deliverable_output?: string;
}

export interface ReportTimeBreakdown {
  id?: number;
  report_id?: number;
  created_at?: string;
  task_type?: TaskType;
  hours_spent?: number;
}

export interface Report {
  id?: number;
  created_at?: string;
  week_start?: string;
  week_end?: string;
  project_tag?: string;
  blockers?: string[];
  key_blocker?: string;
  achievements?: string[];
  key_achievement?: string;
  tasks_planned_next_week?: string;
  notes_or_links?: string;
  status?: ReportStatus;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: number | User | null;
  user_id?: number;
  version_number?: number;
  tasks?: ReportTask[];
  time_breakdowns?: ReportTimeBreakdown[];
}

export interface ReportCreatePayload {
  week_start?: string;
  week_end?: string;
  project_tag?: string;
  blockers?: string[];
  achievements?: string[];
  tasks_planned_next_week?: string;
  key_blocker?: string;
  key_achievement?: string;
  notes_or_links?: string;
  status?: ReportStatus;
  user_id?: number;
  tasks?: ReportTask[];
  time_breakdowns?: ReportTimeBreakdown[];
}

export interface ReportUpdatePayload extends Partial<ReportCreatePayload> {}

export interface ReportListResponse {
  success: boolean;
  message?: string;
  data?: Report[];
  error?: string | null;
}

export interface ReportResponse {
  success: boolean;
  message?: string;
  data?: Report;
  error?: string | null;
}