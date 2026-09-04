from fastapi import APIRouter
from app.api.v1.endpoints import auth
from app.api.v1.endpoints import users

api_router = APIRouter()

# auth router
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# users router
api_router.include_router(users.router, prefix="/users", tags=["users"])