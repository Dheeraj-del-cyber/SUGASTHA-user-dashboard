import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: f"apt-{uuid.uuid4().hex[:8]}")
    token_no = Column(String(50), nullable=False)
    abha_id = Column(String(50), nullable=False)
    patient_name = Column(String(255), nullable=False)
    patient_phone = Column(String(50), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    hospital_id = Column(String(36), nullable=False)
    hospital_name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    doctor_id = Column(String(36), nullable=False)
    doctor_name = Column(String(255), nullable=False)
    room_no = Column(String(100), nullable=False)
    triage_color = Column(String(20), nullable=False)  # RED, YELLOW, GREEN
    triage_reason = Column(Text, nullable=False)
    symptoms = Column(Text, default="[]")              # JSON encoded list of strings
    vitals = Column(Text, default="{}")                # JSON encoded vitals dictionary
    status = Column(String(50), default="PENDING_ACCEPTANCE")  # PENDING_ACCEPTANCE, ACCEPTED, ARRIVED, IN_CONSULTATION, COMPLETED, RE_ROUTED
    referral_source = Column(String(50), default="SELF_APP")   # SELF_APP, ASHA_PHC, IVR_104, VOICE_FALLBACK
    referral_by_asha_name = Column(String(255), nullable=True)
    qr_code_data = Column(Text, nullable=False)
    pin_code = Column(String(20), nullable=False)
    slot_time = Column(String(100), default="Today's Session")
    fallback_cascade_trail = Column(Text, default="[]")  # JSON encoded list of cascade logs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
