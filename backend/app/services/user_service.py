import secrets
from urllib.parse import quote

from fastapi import HTTPException
from supabase import Client

from app.core.config import settings
from app.core.security import hash_password
from app.schemas.user_schema import CreateUserRequest, CreateUserResponse, UserFetcheResponse


def create_user(supabase: Client, request: CreateUserRequest) -> CreateUserResponse:
    """Create an invited user and return a one-time password setup link."""
    existing = (
        supabase.table("users").select("id").eq("email", request.email).limit(1).execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    temporary_password = secrets.token_urlsafe(18)
    setup_token = secrets.token_urlsafe(32)
    result = supabase.table("users").insert({
        "email": request.email,
        "password": hash_password(temporary_password),
        "first_name": request.first_name,
        "last_name": request.last_name,
        "role": request.role,
        "signin_token": setup_token,
        "has_initial_password_changed": False,
        "is_active": True,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user.")

    link = f"{settings.frontend_url}/auth/change-password?token={quote(setup_token)}"
    return CreateUserResponse(message="User created. Share the setup link with the user.", email=request.email, setup_url=link)

def fetch_all_users(supabase: Client) -> UserFetcheResponse:
    """Return all users except admins"""
    try:
        result = (
            supabase
            .table("users")
            .select("id, created_at, first_name, last_name, email, role, has_initial_password_changed, is_active")
            .neq("role", "admin")
            .execute()
        )
        return UserFetcheResponse(
            success=True,
            data=result.data
        )
    except Exception as e:
        return UserFetcheResponse(
            success=False,
            message="Error fetching users",
            error=str(e)
        )