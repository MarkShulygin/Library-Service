from datetime import datetime
from pydantic import BaseModel, EmailStr
import uuid
from enum import Enum

class RoleEnum(str, Enum):
    user = "user"
    admin = "admin"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum  # додаємо роль
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
