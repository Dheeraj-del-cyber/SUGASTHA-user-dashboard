from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class MedicationSchema(BaseModel):
    name: str
    dosage: str
    timing: str
    durationDays: int
    instructions: str

class ConsultationCreate(BaseModel):
    appointment_id: str
    consultation_date: str
    doctor_id: str
    doctor_name: str
    hospital_name: str
    department: str
    chief_complaints: Optional[str] = None
    clinical_observations: Optional[str] = None
    diagnosis: str
    icd10_code: str = "Z00.0"
    medications: List[Dict[str, Any]] = []
    lab_tests_ordered: List[str] = []
    advice: Optional[str] = None
    follow_up_days: int = 3
    abha_synced: bool = True
    abha_transaction_id: str

class ConsultationOut(ConsultationCreate):
    id: str

    class Config:
        from_attributes = True
