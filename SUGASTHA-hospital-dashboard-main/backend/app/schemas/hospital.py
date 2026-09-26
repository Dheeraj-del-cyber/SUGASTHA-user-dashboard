from typing import List, Optional
from pydantic import BaseModel

class HospitalBase(BaseModel):
    name: str
    name_hindi: Optional[str] = None
    hospital_type: str
    district: str
    state: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_km: float = 4.2
    travel_cost_inr: int = 25
    emergency_available: bool = True
    icu_beds_available: int = 14
    total_beds: int = 120
    oxygen_beds_available: int = 45
    opd_capacity: int = 1200
    opd_active_queue: int = 412
    departments: List[str] = []
    doctor_ids: List[str] = []
    rating: float = 4.8
    phone: str = "+91 11 2658 8500"

class HospitalCreate(HospitalBase):
    id: str

class HospitalOut(HospitalBase):
    id: str

    class Config:
        from_attributes = True

class BedUpdate(BaseModel):
    total_beds: Optional[int] = None
    icu_beds_available: Optional[int] = None
    oxygen_beds_available: Optional[int] = None
