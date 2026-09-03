from pydantic import BaseModel, EmailStr
from typing import Literal, Optional


# ── Request Schemas ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: Literal["manager", "team_member", "admin"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str


# ── Response Schemas ─────────────────────────────────────────────────────────

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int                            # bigint from DB
    email: str
    first_name: str
    last_name: str
    role: str
    has_initial_password_changed: Optional[bool] = False
    message: str
