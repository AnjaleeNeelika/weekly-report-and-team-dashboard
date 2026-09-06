from typing import List, Literal, Optional

from pydantic import BaseModel, Field


WeeklyReportStatus = Literal["Draft", "Submitted", "Needs Correction", "Approved"]
TaskPriority = Literal["Low", "Medium", "High", "Critical"]
TaskStatus = Literal["Not Started", "In Progress", "Completed", "Blocked"]
TaskType = Literal["Development", "Testing", "Meetings", "Documentation"]


class ReportTaskBase(BaseModel):
    task_name: Optional[str] = None
    priority: Optional[TaskPriority] = None
    planned_percentage: Optional[float] = None
    actual_percentage: Optional[float] = None
    status: Optional[TaskStatus] = None
    time_planned_hours: Optional[float] = None
    time_spent_hours: Optional[float] = None
    deliverable_output: Optional[str] = None


class ReportTaskCreate(ReportTaskBase):
    pass


class ReportTaskUpdate(ReportTaskBase):
    pass


class ReportTimeBreakdownBase(BaseModel):
    task_type: Optional[TaskType] = None
    hours_spent: Optional[float] = None


class ReportTimeBreakdownCreate(ReportTimeBreakdownBase):
    pass


class ReportBase(BaseModel):
    week_start: Optional[str] = None
    week_end: Optional[str] = None
    project_tag: Optional[str] = None
    blockers: Optional[List[str]] = None
    key_blocker: Optional[str] = None
    key_achievement: Optional[str] = None
    achievements: Optional[List[str]] = None
    tasks_planned_next_week: Optional[str] = None
    notes_or_links: Optional[str] = None
    status: Optional[WeeklyReportStatus] = "Draft"
    submitted_at: Optional[str] = None
    reviewed_at: Optional[str] = None
    reviewed_by: Optional[int] = None
    user_id: Optional[int] = None
    updated_at: Optional[str] = None
    version_number: Optional[int] = 1


class ReportCreate(ReportBase):
    tasks: List[ReportTaskCreate] = Field(default_factory=list)
    time_breakdowns: List[ReportTimeBreakdownCreate] = Field(default_factory=list)


class ReportUpdate(ReportBase):
    tasks: Optional[List[ReportTaskCreate]] = None
    time_breakdowns: Optional[List[ReportTimeBreakdownCreate]] = None


class ReportTask(ReportTaskBase):
    id: Optional[int] = None
    report_id: Optional[int] = None
    created_at: Optional[str] = None


class ReportTimeBreakdown(ReportTimeBreakdownBase):
    id: Optional[int] = None
    report_id: Optional[int] = None
    created_at: Optional[str] = None


class ReportDetail(ReportBase):
    id: Optional[int] = None
    created_at: Optional[str] = None
    tasks: List[ReportTask] = Field(default_factory=list)
    time_breakdowns: List[ReportTimeBreakdown] = Field(default_factory=list)


class ReportListResponse(BaseModel):
    success: bool
    message: Optional[str] = ""
    data: List[ReportDetail] = Field(default_factory=list)
    error: Optional[str] = None


class ReportResponse(BaseModel):
    success: bool
    message: Optional[str] = ""
    data: Optional[ReportDetail] = None
    error: Optional[str] = None
