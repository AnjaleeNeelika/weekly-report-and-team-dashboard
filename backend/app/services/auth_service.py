from fastapi import HTTPException
from supabase import Client
from app.schemas.auth_schema import (
    RegisterRequest,
    LoginRequest,
    ChangePasswordRequest,
    AuthResponse,
)
from app.core.security import hash_password, verify_password, create_access_token


def fetch_user_by_email(supabase: Client, email: str) -> dict | None:
    """Return a single user row by email, or None if not found."""
    try:
        result = (
            supabase.table("users")
            .select("id, email, password, first_name, last_name, role, signin_token, has_initial_password_changed")
            .eq("email", email)
            .limit(1)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")


def register_user(supabase: Client, request: RegisterRequest) -> AuthResponse:
    """
    Create a new user account:
    1. Reject duplicate emails.
    2. Hash password with bcrypt.
    3. Insert into public.users table.
    4. Issue and return JWT + user payload.
    """
    try:
        if fetch_user_by_email(supabase, request.email):
            raise HTTPException(status_code=409, detail="An account with this email already exists.")

        hashed = hash_password(request.password)

        result = (
            supabase.table("users")
            .insert({
                "email": request.email,
                "password": hashed,
                "first_name": request.first_name,
                "last_name": request.last_name,
                "role": request.role,
                "has_initial_password_changed": False,
            })
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user. Database returned empty result.")

        user = result.data[0]

        token = create_access_token({
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"],
        })

        return AuthResponse(
            access_token=token,
            user_id=user["id"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            role=user["role"],
            has_initial_password_changed=user.get("has_initial_password_changed"),
            message="Registration successful. Please change your password on first login.",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def login_user(supabase: Client, request: LoginRequest) -> AuthResponse:
    """
    Authenticate a user with email and password.
    Returns JWT and user payload.
    """
    try:
        user = fetch_user_by_email(supabase, request.email)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        if not verify_password(request.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        token = create_access_token({
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"],
        })

        password_changed = user.get("has_initial_password_changed")
        is_changed = str(password_changed).lower() == "true" or password_changed is True

        message = (
            "Login successful."
            if is_changed
            else "Login successful. Please change your initial password."
        )

        return AuthResponse(
            access_token=token,
            user_id=user["id"],
            email=user["email"],
            first_name=user.get("first_name") or "",
            last_name=user.get("last_name") or "",
            role=user.get("role") or "employee",
            has_initial_password_changed=password_changed,
            message=message,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def change_password(supabase: Client, request: ChangePasswordRequest) -> dict:
    """
    Allows a user to change their password and updates `has_initial_password_changed` to 'true'.
    """
    try:
        user = fetch_user_by_email(supabase, request.email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        if not verify_password(request.current_password, user["password"]):
            raise HTTPException(status_code=401, detail="Current password is incorrect.")

        new_hash = hash_password(request.new_password)
        supabase.table("users").update({
            "password": new_hash,
            "has_initial_password_changed": True,
        }).eq("id", user["id"]).execute()

        return {"message": "Password changed successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


def logout_user() -> dict:
    """
    Stateless JWT logout indicator response.
    """
    return {"message": "Logged out successfully. Please remove your token on the client."}
