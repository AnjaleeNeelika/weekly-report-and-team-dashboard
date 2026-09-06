from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.db.supabase_client import get_supabase
from app.schemas.report_schema import ReportCreate, ReportListResponse, ReportResponse, ReportUpdate
from app.services.report_service import (
    create_report,
    delete_report,
    get_report_by_id,
    get_reports,
    submit_report,
    update_report,
)

router = APIRouter()


@router.post("/", response_model=ReportResponse)
async def add_report(request: ReportCreate, supabase: Client = Depends(get_supabase)):
    try:
        result = create_report(supabase, request)
        return ReportResponse(success=True, message=result["message"], data=result["data"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/", response_model=ReportListResponse)
async def list_reports(
    user_id: int | None = Query(default=None),
    supabase: Client = Depends(get_supabase),
):
    try:
        result = get_reports(supabase, user_id=user_id)
        return ReportListResponse(success=True, message=result["message"], data=result["data"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/member/{user_id}", response_model=ReportListResponse)
async def list_reports_for_member(user_id: int, supabase: Client = Depends(get_supabase)):
    try:
        result = get_reports(supabase, user_id=user_id)
        return ReportListResponse(success=True, message=f"Reports for member {user_id} fetched successfully.", data=result["data"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{report_id}", response_model=ReportResponse)
async def fetch_report(report_id: int, supabase: Client = Depends(get_supabase)):
    try:
        result = get_report_by_id(supabase, report_id)
        return ReportResponse(success=True, message=result["message"], data=result["data"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/{report_id}", response_model=ReportResponse)
async def edit_report(report_id: int, request: ReportUpdate, supabase: Client = Depends(get_supabase)):
    try:
        result = update_report(supabase, report_id, request)
        return ReportResponse(success=True, message=result["message"], data=result["data"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/{report_id}/submit", response_model=ReportResponse)
async def submit_for_review(report_id: int, supabase: Client = Depends(get_supabase)):
    try:
        result = submit_report(supabase, report_id)
        return ReportResponse(success=True, message="Report submitted for review.", data=result["data"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{report_id}", response_model=ReportResponse)
async def remove_report(report_id: int, supabase: Client = Depends(get_supabase)):
    try:
        result = delete_report(supabase, report_id)
        return ReportResponse(success=True, message=result["message"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
