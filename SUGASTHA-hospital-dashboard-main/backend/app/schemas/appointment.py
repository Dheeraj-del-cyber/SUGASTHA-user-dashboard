from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class AppointmentCreate(BaseModel):
    id: Optional[str] = None
    token_no: Optional[str] = None
    abha_id: str
    patient_name: str
    patient_phone: str
    age: int
    gender: str
    hospital_id: str
    hospital_name: str
    department: str
    doctor_id: str
    doctor_name: str
    room_no: str
    triage_color: str
    triage_reason: str
    symptoms: List[str] = []
    vitals: Optional[Dict[str, Any]] = None
    status: str = "PENDING_ACCEPTANCE"
    referral_source: str = "SELF_APP"
    referral_by_asha_name: Optional[str] = None
    qr_code_data: Optional[str] = None
    pin_code: Optional[str] = None
    slot_time: Optional[str] = "Today's Session"
    fallback_cascade_trail: List[str] = []

class AppointmentStatusUpdate(BaseModel):
    status: str
    reject_reason: Optional[str] = None

class AppointmentOut(BaseModel):
    id: str
    token_no: str
    abha_id: str
    patient_name: str
    patient_phone: str
    age: int
    gender: str
    hospital_id: str
    hospital_name: str
    department: str
    doctor_id: str
    doctor_name: str
    room_no: str
    triage_color: str
    triage_reason: str
    symptoms: List[str]
    vitals: Optional[Dict[str, Any]]
    status: str
    referral_source: str
    referral_by_asha_name: Optional[str]
    qr_code_data: str
    pin_code: str
    slot_time: str
    fallback_cascade_trail: List[str]
    created_at: Optional[Any] = None

    class Config:
        from_attributes = True
