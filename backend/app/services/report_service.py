from datetime import datetime, timezone

from fastapi import HTTPException
from supabase import Client

from app.schemas.report_schema import ReportCreate, ReportResubmissionRequest, ReportReviewRequest, ReportUpdate

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


def _is_editable_status(value: str | None) -> bool:
    normalized = _normalize_status(value).strip().lower().replace("_", " ").replace("-", " ")
    return normalized in {"draft", "needs correction"}


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
        review_comments = (
            supabase.table("report_review_comments")
            .select("*")
            .eq("report_id", report_id)
            .order("created_at", desc=True)
            .execute()
            .data
            or []
        )
        return {
            "success": True,
            "message": "Report fetched successfully.",
            "data": {
                **report,
                "tasks": tasks,
                "time_breakdowns": breakdowns,
                "review_comments": review_comments,
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error fetching report: {str(exc)}")


def update_report(supabase: Client, report_id: int, request: ReportUpdate) -> dict:
    existing_result = supabase.table("reports").select("id, status, version_number").eq("id", report_id).limit(1).execute()
    if not existing_result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    current_status = _normalize_status(existing_result.data[0].get("status"))
    if not _is_editable_status(current_status):
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
    existing_result = supabase.table("reports").select("id, status, version_number").eq("id", report_id).limit(1).execute()
    if not existing_result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    current_status = _normalize_status(existing_result.data[0].get("status"))
    if not _is_editable_status(current_status):
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


def review_report(
    supabase: Client,
    report_id: int,
    request: ReportReviewRequest,
    reviewer_id: int,
) -> dict:
    """Approve a submitted report or return it to the author for correction."""
    existing_result = supabase.table("reports").select("id, status, version_number").eq("id", report_id).limit(1).execute()
    if not existing_result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    if _normalize_status(existing_result.data[0].get("status")) != "Submitted":
        raise HTTPException(status_code=400, detail="Only submitted reports can be reviewed.")

    now = datetime.now(timezone.utc).isoformat()
    payload = {
        "status": request.status,
        "review_comment": request.review_comment.strip() if request.review_comment else None,
        "reviewed_at": now,
        "reviewed_by": reviewer_id,
        "updated_at": now,
    }
    try:
        supabase.table("report_review_comments").insert({
            "report_id": report_id,
            "reviewer_id": reviewer_id,
            "version_number": existing_result.data[0].get("version_number") or 1,
            "comment": payload["review_comment"],
            "action": request.status,
        }).execute()
        result = supabase.table("reports").update(payload).eq("id", report_id).execute()
    except Exception as exc:
        if "schema cache" in str(exc) and ("review_comment" in str(exc) or "report_review_comments" in str(exc)):
            raise HTTPException(
                status_code=503,
                detail="Review workflow database migration is incomplete. Run supabase_review_cycle.sql in Supabase.",
            )
        raise HTTPException(status_code=400, detail=f"Error reviewing report: {str(exc)}")

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found.")
    return get_report_by_id(supabase, report_id)


def resubmit_report(
    supabase: Client,
    report_id: int,
    member_id: int,
    request: ReportResubmissionRequest,
) -> dict:
    """Snapshot the corrected report and submit it for another review."""
    report_result = supabase.table("reports").select("*").eq("id", report_id).limit(1).execute()
    if not report_result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    report = report_result.data[0]
    if report.get("user_id") != member_id:
        raise HTTPException(status_code=403, detail="You can only resubmit your own reports.")
    if _normalize_status(report.get("status")) != "Needs Correction":
        raise HTTPException(status_code=400, detail="Only reports needing correction can be resubmitted.")

    tasks = supabase.table("report_tasks").select("*").eq("report_id", report_id).execute().data or []
    breakdowns = supabase.table("report_time_breakdowns").select("*").eq("report_id", report_id).execute().data or []
    version_number = report.get("version_number") or 1
    snapshot = {key: value for key, value in report.items() if key not in {"id", "created_at"}}
    snapshot.update({"tasks": tasks, "time_breakdowns": breakdowns})
    snapshot["review_comment"] = report.get("review_comment")
    snapshot["reviewed_by"] = report.get("reviewed_by")

    try:
        supabase.table("report_versions").insert({
            "report_id": report_id,
            "version_number": version_number,
            "report_data": snapshot,
            "submitted_at": report.get("submitted_at"),
        }).execute()
        now = datetime.now(timezone.utc).isoformat()
        content_payload = _clean_payload(
            request.report_data.model_dump(exclude={"tasks", "time_breakdowns"})
        )
        content_payload.update({
            "status": "Submitted",
            "version_number": version_number + 1,
            "submitted_at": now,
            "updated_at": now,
        })
        result = supabase.table("reports").update(content_payload).eq("id", report_id).execute()

        if request.report_data.tasks is not None:
            supabase.table("report_tasks").delete().eq("report_id", report_id).execute()
            if request.report_data.tasks:
                supabase.table("report_tasks").insert([
                    {**task.model_dump(exclude_none=True), "report_id": report_id}
                    for task in request.report_data.tasks
                ]).execute()

        if request.report_data.time_breakdowns is not None:
            supabase.table("report_time_breakdowns").delete().eq("report_id", report_id).execute()
            if request.report_data.time_breakdowns:
                supabase.table("report_time_breakdowns").insert([
                    {**entry.model_dump(exclude_none=True), "report_id": report_id}
                    for entry in request.report_data.time_breakdowns
                ]).execute()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error resubmitting report: {str(exc)}")

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found.")
    return get_report_by_id(supabase, report_id)


def get_report_versions(supabase: Client, report_id: int) -> dict:
    report_result = supabase.table("reports").select("id").eq("id", report_id).limit(1).execute()
    if not report_result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    try:
        result = (
            supabase.table("report_versions")
            .select("*")
            .eq("report_id", report_id)
            .order("version_number", desc=True)
            .execute()
        )
        return {"success": True, "message": "Report versions fetched successfully.", "data": result.data or []}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error fetching report versions: {str(exc)}")


def delete_report(supabase: Client, report_id: int) -> dict:
    try:
        result = supabase.table("reports").delete().eq("id", report_id).execute()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Error deleting report: {str(exc)}")

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found.")

    return {"success": True, "message": "Report deleted successfully."}
