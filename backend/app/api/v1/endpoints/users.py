from fastapi import APIRouter, Depends, HTTPException, Request
from jose import JWTError
from supabase import Client
from app.db.supabase_client import get_supabase
from app.schemas.user_schema import CreateUserRequest, CreateUserResponse, UserFetcheResponse
from app.services.user_service import create_user, fetch_all_users
from app.core.security import decode_access_token

router = APIRouter()


def require_manager_or_admin(request: Request) -> None:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token.")
    if payload.get("role") not in {"admin", "manager"}:
        raise HTTPException(status_code=403, detail="You are not allowed to create users.")

@router.post("/", response_model=CreateUserResponse)
async def add_user(request: CreateUserRequest, _: None = Depends(require_manager_or_admin), supabase: Client = Depends(get_supabase)):
    return create_user(supabase, request)

@router.get("/", response_model=UserFetcheResponse)
async def get_all_users(supabase: Client = Depends(get_supabase)):
    """Fetch all users"""
    return fetch_all_users(supabase)
    