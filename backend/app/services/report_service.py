from datetime import datetime, timezone

from fastapi import HTTPException
from supabase import Client

from app.schemas.report_schema import ReportCreate, ReportUpdate

STATUS_MAPPING = {
    "draft": "Draft",
    "submitted": "Submitted",
    "needs correction": "Needs Correction",
    "needs_correction": "Needs Correction",
    "needscorrection": "Needs Correction",
    "approved": "Approved",
}


def _clean_payload(data: dict) -> dict:
    return {key: value for key, value in data.items() if value is not None}


def _normalize_status(value: str | None) -> str:
    if not value:
        return "Draft"
    cleaned = value.strip().lower()
    return STATUS_MAPPING.get(cleaned, value)


def create_report(supabase: Client, request: ReportCreate) -> dict:
    payload = _clean_payload(request.model_dump(exclude={"tasks", "time_breakdowns"}))
    payload["status"] = _normalize_status(payload.get("status", "draft"))
    payload["version_number"] = payload.get("version_number") or 1

    try:
        report_result = supabase.table("reports").insert(payload).execute()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error creating report: {str(exc)}")

    if not report_result.data:
        raise HTTPException(status_code=500, detail="Failed to create report.")

    report = report_result.data[0]
    report_id = report["id"]

    if request.tasks:
        task_rows = [
            {**task.model_dump(exclude_none=True), "report_id": report_id}
            for task in request.tasks
        ]
        try:
            supabase.table("report_tasks").insert(task_rows).execute()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Error creating report tasks: {str(exc)}")

    if request.time_breakdowns:
        breakdown_rows = [
            {**entry.model_dump(exclude_none=True), "report_id": report_id}
            for entry in request.time_breakdowns
        ]
        try:
            supabase.table("report_time_breakdowns").insert(breakdown_rows).execute()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Error creating time breakdown entries: {str(exc)}")

    return {"success": True, "message": "Report created successfully.", "data": report}


def get_reports(supabase: Client, user_id: int | None = None) -> dict:
    try:
        query = supabase.table("reports").select("*")
        if user_id is not None:
            query = query.eq("user_id", user_id)

        report_result = query.order("week_start", desc=True).execute()
        reports = report_result.data or []

        report_data = []
        for report in reports:
            tasks = supabase.table("report_tasks").select("*").eq("report_id", report["id"]).execute().data or []
            breakdowns = (
                supabase.table("report_time_breakdowns").select("*").eq("report_id", report["id"]).execute().data or []
            )
            report_data.append({**report, "tasks": tasks, "time_breakdowns": breakdowns})

        return {"success": True, "message": "Reports fetched successfully.", "data": report_data}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error fetching reports: {str(exc)}")


def get_report_by_id(supabase: Client, report_id: int) -> dict:
    try:
        report_result = supabase.table("reports").select("*").eq("id", report_id).limit(1).execute()
        if not report_result.data:
            raise HTTPException(status_code=404, detail="Report not found.")

        report = report_result.data[0]
        tasks = supabase.table("report_tasks").select("*").eq("report_id", report_id).execute().data or []
        breakdowns = (
            supabase.table("report_time_breakdowns").select("*").eq("report_id", report_id).execute().data or []
        )
        return {"success": True, "message": "Report fetched successfully.", "data": {**report, "tasks": tasks, "time_breakdowns": breakdowns}}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error fetching report: {str(exc)}")


def update_report(supabase: Client, report_id: int, request: ReportUpdate) -> dict:
    existing_result = supabase.table("reports").select("id, status").eq("id", report_id).limit(1).execute()
    if not existing_result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    current_status = _normalize_status(existing_result.data[0].get("status"))
    if current_status not in {"draft", "needs_correction"}:
        raise HTTPException(status_code=403, detail="This report can no longer be edited in its current status.")

    payload = _clean_payload(request.model_dump(exclude={"tasks", "time_breakdowns"}))
    if payload:
        payload["status"] = _normalize_status(payload.get("status", current_status))
        payload["updated_at"] = datetime.now(timezone.utc).isoformat()
        try:
            supabase.table("reports").update(payload).eq("id", report_id).execute()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Error updating report: {str(exc)}")

    if request.tasks is not None:
        try:
            supabase.table("report_tasks").delete().eq("report_id", report_id).execute()
            if request.tasks:
                rows = [{**task.model_dump(exclude_none=True), "report_id": report_id} for task in request.tasks]
                supabase.table("report_tasks").insert(rows).execute()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Error updating report tasks: {str(exc)}")

    if request.time_breakdowns is not None:
        try:
            supabase.table("report_time_breakdowns").delete().eq("report_id", report_id).execute()
            if request.time_breakdowns:
                rows = [{**entry.model_dump(exclude_none=True), "report_id": report_id} for entry in request.time_breakdowns]
                supabase.table("report_time_breakdowns").insert(rows).execute()
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Error updating time breakdowns: {str(exc)}")

    return get_report_by_id(supabase, report_id)


def submit_report(supabase: Client, report_id: int) -> dict:
    existing_result = supabase.table("reports").select("id, status").eq("id", report_id).limit(1).execute()
    if not existing_result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    current_status = _normalize_status(existing_result.data[0].get("status"))
    if current_status not in {"draft", "needs_correction"}:
        raise HTTPException(status_code=400, detail="Only draft or needs-correction reports can be submitted.")

    try:
        supabase.table("reports").update({
            "status": "submitted",
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", report_id).execute()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error submitting report: {str(exc)}")

    return get_report_by_id(supabase, report_id)


def delete_report(supabase: Client, report_id: int) -> dict:
    try:
        result = supabase.table("reports").delete().eq("id", report_id).execute()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error deleting report: {str(exc)}")

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    return {"success": True, "message": "Report deleted successfully."}
