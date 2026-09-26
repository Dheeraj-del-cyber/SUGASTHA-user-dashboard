import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.consultation import Consultation
from app.models.appointment import Appointment
from app.schemas.consultation import ConsultationOut, ConsultationCreate

router = APIRouter()

def serialize_consultation(c: Consultation) -> dict:
    return {
        "id": c.id,
        "appointment_id": c.appointment_id,
        "consultation_date": c.consultation_date,
        "doctor_id": c.doctor_id,
        "doctor_name": c.doctor_name,
        "hospital_name": c.hospital_name,
        "department": c.department,
        "chief_complaints": c.chief_complaints,
        "clinical_observations": c.clinical_observations,
        "diagnosis": c.diagnosis,
        "icd10_code": c.icd10_code,
        "medications": json.loads(c.medications) if c.medications else [],
        "lab_tests_ordered": json.loads(c.lab_tests_ordered) if c.lab_tests_ordered else [],
        "advice": c.advice,
        "follow_up_days": c.follow_up_days,
        "abha_synced": c.abha_synced,
        "abha_transaction_id": c.abha_transaction_id
    }

@router.post("", response_model=ConsultationOut)
def create_consultation(c_in: ConsultationCreate, db: Session = Depends(get_db)):
    c_id = f"cslt-{uuid.uuid4().hex[:8]}"
    consultation = Consultation(
        id=c_id,
        appointment_id=c_in.appointment_id,
        consultation_date=c_in.consultation_date,
        doctor_id=c_in.doctor_id,
        doctor_name=c_in.doctor_name,
        hospital_name=c_in.hospital_name,
        department=c_in.department,
        chief_complaints=c_in.chief_complaints,
        clinical_observations=c_in.clinical_observations,
        diagnosis=c_in.diagnosis,
        icd10_code=c_in.icd10_code,
        medications=json.dumps(c_in.medications),
        lab_tests_ordered=json.dumps(c_in.lab_tests_ordered),
        advice=c_in.advice,
        follow_up_days=c_in.follow_up_days,
        abha_synced=c_in.abha_synced,
        abha_transaction_id=c_in.abha_transaction_id
    )
    db.add(consultation)

    # Automatically mark the corresponding appointment as COMPLETED
    apt = db.query(Appointment).filter(Appointment.id == c_in.appointment_id).first()
    if apt:
        apt.status = "COMPLETED"

    db.commit()
    db.refresh(consultation)
    return serialize_consultation(consultation)

@router.get("/by-appointment/{appointment_id}", response_model=ConsultationOut)
def get_consultation_by_appointment(appointment_id: str, db: Session = Depends(get_db)):
    c = db.query(Consultation).filter(Consultation.appointment_id == appointment_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation not found for this appointment")
    return serialize_consultation(c)
