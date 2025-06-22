from sqlalchemy import Column, String, Enum, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid
import enum
from .database import Base  # переконайся, що це правильний Base
from sqlalchemy.sql import func

class RoleEnum(enum.Enum):
    user = "user"
    admin = "admin"

class User(Base):  # має наслідуватися від Base!
    __tablename__ = "users"  # обов’язково!

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.user)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
