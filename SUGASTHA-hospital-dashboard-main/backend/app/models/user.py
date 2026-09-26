import uuid
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)  # PATIENT, ASHA, HOSPITAL_ADMIN, HOSPITAL_STAFF, DOCTOR, SYSTEM_ADMIN
    hashed_password = Column(String, nullable=True) # None for PATIENT/ASHA who use OTP
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
