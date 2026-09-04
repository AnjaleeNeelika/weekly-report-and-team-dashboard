from fastapi import APIRouter, Depends, HTTPException, Request, Response
from supabase import Client
from app.schemas.auth_schema import RegisterRequest, LoginRequest, ChangePasswordRequest, SetInitialPasswordRequest, AuthUserResponse
from app.db.supabase_client import get_supabase
from app.services.auth_service import (
    register_user,
    login_user,
    change_password as change_password_service,
    set_initial_password,
    logout_user,
)
from app.core.config import settings
from app.core.security import decode_access_token
from jose import JWTError

router = APIRouter()


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=settings.access_token_expire_minutes * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


@router.post("/register", response_model=AuthUserResponse, summary="Register a new user")
def register(request: RegisterRequest, response: Response, supabase: Client = Depends(get_supabase)):
    """
    Register a new user account.
    """
    auth_response = register_user(supabase, request)
    _set_auth_cookie(response, auth_response.access_token)
    return AuthUserResponse(**auth_response.model_dump(exclude={"access_token", "token_type"}))


@router.post("/login", response_model=AuthUserResponse, summary="Login with email and password")
def login(request: LoginRequest, response: Response, supabase: Client = Depends(get_supabase)):
    """
    Authenticate a user.
    """
    auth_response = login_user(supabase, request)
    _set_auth_cookie(response, auth_response.access_token)
    return AuthUserResponse(**auth_response.model_dump(exclude={"access_token", "token_type"}))


@router.get("/me", response_model=AuthUserResponse, summary="Get the current user")
def current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated.")

    try:
        payload = decode_access_token(token)
        return AuthUserResponse(
            user_id=int(payload["sub"]),
            email=payload["email"],
            first_name=payload.get("first_name", ""),
            last_name=payload.get("last_name", ""),
            role=payload.get("role", "employee"),
        )
    except (JWTError, KeyError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid authentication token.")


@router.post("/change-password", summary="Change password (required on first login)")
def change_password(request: ChangePasswordRequest, supabase: Client = Depends(get_supabase)):
    """
    Change user password.
    """
    return change_password_service(supabase, request)


@router.post("/set-initial-password", summary="Set password from an invitation link")
def set_password(request: SetInitialPasswordRequest, supabase: Client = Depends(get_supabase)):
    return set_initial_password(supabase, request.token, request.new_password)


@router.post("/logout", summary="Logout current user")
def logout(response: Response):
    """
    Logout current user.
    """
    response.delete_cookie(key="access_token", path="/")
    return logout_user()
