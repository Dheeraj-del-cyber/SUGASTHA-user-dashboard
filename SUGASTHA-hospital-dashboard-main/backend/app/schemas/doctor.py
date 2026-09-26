from typing import Optional
from pydantic import BaseModel

class DoctorBase(BaseModel):
    hospital_id: str
    name: str
    specialty: str
    specialty_hindi: Optional[str] = None
    qualification: str
    experience_years: int = 10
    room_no: str
    aebas_status: str = "IN_OPD"
    aebas_check_in_time: str = "08:30 AM IST"
    max_daily_slots: int = 45
    booked_slots: int = 20
    current_queue_length: int = 4
    consultation_fee: int = 0
    rating: float = 4.9
    opd_timing: Optional[str] = "Mon-Sat, 9:00 AM - 1:00 PM"
    available_days: Optional[str] = "Mon,Tue,Wed,Thu,Fri,Sat"
    phone: Optional[str] = None
    email: Optional[str] = None

class DoctorCreate(DoctorBase):
    id: Optional[str] = None

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    specialty_hindi: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    room_no: Optional[str] = None
    aebas_status: Optional[str] = None
    aebas_check_in_time: Optional[str] = None
    max_daily_slots: Optional[int] = None
    booked_slots: Optional[int] = None
    current_queue_length: Optional[int] = None
    consultation_fee: Optional[int] = None
    rating: Optional[float] = None
    opd_timing: Optional[str] = None
    available_days: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class DoctorOut(DoctorBase):
    id: str

    class Config:
        from_attributes = True

class DoctorStatusUpdate(BaseModel):
    aebas_status: str

class ExtractedDoctorEntry(BaseModel):
    name: str
    specialty: Optional[str] = None
    opd_timing: Optional[str] = None
    room_no: Optional[str] = None
    raw_line: str
