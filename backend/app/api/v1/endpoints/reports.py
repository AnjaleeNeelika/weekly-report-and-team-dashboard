from fastapi import APIRouter, Depends, HTTPException, Query, Request
from jose import JWTError
from supabase import Client

from app.db.supabase_client import get_supabase
from app.schemas.report_schema import (
    ReportCreate,
    ReportListResponse,
    ReportResponse,
    ReportReviewRequest,
    ReportResubmissionRequest,
    ReportUpdate,
    ReportVersion,
    ReportVersionsResponse,
)
from app.core.security import decode_access_token
from app.services.report_service import (
    create_report,
    delete_report,
    get_report_by_id,
    get_reports,
    get_report_versions,
    review_report,
    resubmit_report,
    submit_report,
    update_report,
)

router = APIRouter()


def require_authenticated_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    try:
        return decode_access_token(token)
    except (JWTError, KeyError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid authentication token.")


def require_manager(request: Request) -> dict:
    payload = require_authenticated_user(request)
    if payload.get("role") not in {"manager", "admin"}:
        raise HTTPException(status_code=403, detail="Only managers can review reports.")
    return payload


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


@router.patch("/{report_id}/review", response_model=ReportResponse)
async def review(
    report_id: int,
    request: ReportReviewRequest,
    user: dict = Depends(require_manager),
    supabase: Client = Depends(get_supabase),
):
    try:
        result = review_report(supabase, report_id, request, int(user["sub"]))
        return ReportResponse(success=True, message="Report review saved.", data=result["data"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/{report_id}/resubmit", response_model=ReportResponse)
async def resubmit(
    report_id: int,
    request: ReportResubmissionRequest,
    user: dict = Depends(require_authenticated_user),
    supabase: Client = Depends(get_supabase),
):
    try:
        result = resubmit_report(supabase, report_id, int(user["sub"]), request)
        return ReportResponse(success=True, message="Report resubmitted for review.", data=result["data"])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{report_id}/versions", response_model=ReportVersionsResponse)
async def versions(
    report_id: int,
    user: dict = Depends(require_authenticated_user),
    supabase: Client = Depends(get_supabase),
):
    try:
        report = get_report_by_id(supabase, report_id)["data"]
        is_manager = user.get("role") in {"manager", "admin"}
        if not is_manager and report.get("user_id") != int(user["sub"]):
            raise HTTPException(status_code=403, detail="You can only view versions of your own reports.")
        result = get_report_versions(supabase, report_id)
        return ReportVersionsResponse(success=True, message=result["message"], data=result["data"])
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
