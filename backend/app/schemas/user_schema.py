from pydantic import BaseModel
from typing import Literal, Optional, List

class CreateUserRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    role: Literal["manager", "team_member"]

class CreateUserResponse(BaseModel):
    message: str
    email: str
    setup_url: str

class User(BaseModel):
    id: int
    created_at: str
    first_name: str
    last_name: str
    email: str
    role: str
    has_initial_password_changed: Optional[bool] = False
    is_active: bool

class UserFetcheResponse(BaseModel):
    success: bool
    message: Optional[str] = ""
    data: Optional[List[User]] = []
    error: Optional[str] = None
    
