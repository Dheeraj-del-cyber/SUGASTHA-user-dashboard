import uuid
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String(36), primary_key=True, default=lambda: f"cslt-{uuid.uuid4().hex[:8]}")
    appointment_id = Column(String(36), nullable=False)
    consultation_date = Column(String(100), nullable=False)
    doctor_id = Column(String(36), nullable=False)
    doctor_name = Column(String(255), nullable=False)
    hospital_name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    chief_complaints = Column(Text, nullable=True)
    clinical_observations = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=False)
    icd10_code = Column(String(50), default="Z00.0")
    medications = Column(Text, default="[]")          # JSON encoded list of medication objects
    lab_tests_ordered = Column(Text, default="[]")    # JSON encoded list of lab tests
    advice = Column(Text, nullable=True)
    follow_up_days = Column(Integer, default=3)
    abha_synced = Column(Boolean, default=True)
    abha_transaction_id = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
