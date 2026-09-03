from fastapi import APIRouter, Depends
from supabase import Client
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    ChangePasswordRequest,
    AuthResponse,
)
from app.db.supabase_client import get_supabase
from app.services.auth_service import (
    register_user,
    login_user,
    change_password as change_password_service,
    logout_user,
)

router = APIRouter()


@router.post("/register", response_model=AuthResponse, summary="Register a new user")
def register(request: RegisterRequest, supabase: Client = Depends(get_supabase)):
    """
    Register a new user account.
    """
    return register_user(supabase, request)


@router.post("/login", response_model=AuthResponse, summary="Login with email and password")
def login(request: LoginRequest, supabase: Client = Depends(get_supabase)):
    """
    Authenticate a user.
    """
    return login_user(supabase, request)


@router.post("/change-password", summary="Change password (required on first login)")
def change_password(request: ChangePasswordRequest, supabase: Client = Depends(get_supabase)):
    """
    Change user password.
    """
    return change_password_service(supabase, request)


@router.post("/logout", summary="Logout current user")
def logout():
    """
    Logout current user.
    """
    return logout_user()
