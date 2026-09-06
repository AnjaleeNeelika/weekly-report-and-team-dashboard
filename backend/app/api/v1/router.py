from fastapi import APIRouter
from app.api.v1.endpoints import auth, reports, users

api_router = APIRouter()

# auth router
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# users router
api_router.include_router(users.router, prefix="/users", tags=["users"])

# reports router
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])