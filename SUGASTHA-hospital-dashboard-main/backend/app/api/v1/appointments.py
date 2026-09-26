import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.appointment import Appointment
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.schemas.appointment import AppointmentOut, AppointmentCreate, AppointmentStatusUpdate

router = APIRouter()

def serialize_appointment(a: Appointment) -> dict:
    return {
        "id": a.id,
        "token_no": a.token_no,
        "abha_id": a.abha_id,
        "patient_name": a.patient_name,
        "patient_phone": a.patient_phone,
        "age": a.age,
        "gender": a.gender,
        "hospital_id": a.hospital_id,
        "hospital_name": a.hospital_name,
        "department": a.department,
        "doctor_id": a.doctor_id,
        "doctor_name": a.doctor_name,
        "room_no": a.room_no,
        "triage_color": a.triage_color,
        "triage_reason": a.triage_reason,
        "symptoms": json.loads(a.symptoms) if a.symptoms else [],
        "vitals": json.loads(a.vitals) if a.vitals else {},
        "status": a.status,
        "referral_source": a.referral_source,
        "referral_by_asha_name": a.referral_by_asha_name,
        "qr_code_data": a.qr_code_data,
        "pin_code": a.pin_code,
        "slot_time": a.slot_time,
        "fallback_cascade_trail": json.loads(a.fallback_cascade_trail) if a.fallback_cascade_trail else [],
        "created_at": a.created_at
    }

@router.get("", response_model=List[AppointmentOut])
def get_appointments(
    hospital_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Appointment)
    if hospital_id:
        query = query.filter(Appointment.hospital_id == hospital_id)
    if status and status != "ALL":
        query = query.filter(Appointment.status == status)
    
    appointments = query.order_by(Appointment.created_at.desc()).all()
    return [serialize_appointment(a) for a in appointments]

@router.post("", response_model=AppointmentOut)
def create_appointment(apt_in: AppointmentCreate, db: Session = Depends(get_db)):
    apt_id = apt_in.id or f"apt-{uuid.uuid4().hex[:8]}"
    pin = apt_in.pin_code or str(uuid.uuid4().int)[:6]
    token = apt_in.token_no or f"TKN-{apt_id[-4:].upper()}"
    qr = apt_in.qr_code_data or f"SUGASTHA-SECURE-{token}-{apt_in.abha_id}-PIN-{pin}"

    apt = Appointment(
        id=apt_id,
        token_no=token,
        abha_id=apt_in.abha_id,
        patient_name=apt_in.patient_name,
        patient_phone=apt_in.patient_phone,
        age=apt_in.age,
        gender=apt_in.gender,
        hospital_id=apt_in.hospital_id,
        hospital_name=apt_in.hospital_name,
        department=apt_in.department,
        doctor_id=apt_in.doctor_id,
        doctor_name=apt_in.doctor_name,
        room_no=apt_in.room_no,
        triage_color=apt_in.triage_color,
        triage_reason=apt_in.triage_reason,
        symptoms=json.dumps(apt_in.symptoms),
        vitals=json.dumps(apt_in.vitals) if apt_in.vitals else "{}",
        status=apt_in.status,
        referral_source=apt_in.referral_source,
        referral_by_asha_name=apt_in.referral_by_asha_name,
        qr_code_data=qr,
        pin_code=pin,
        slot_time=apt_in.slot_time or "Today's Session",
        fallback_cascade_trail=json.dumps(apt_in.fallback_cascade_trail)
    )
    db.add(apt)
    db.commit()
    db.refresh(apt)
    return serialize_appointment(apt)

@router.post("/{appointment_id}/accept", response_model=AppointmentOut)
def accept_appointment(appointment_id: str, db: Session = Depends(get_db)):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    trail = json.loads(apt.fallback_cascade_trail) if apt.fallback_cascade_trail else []
    trail.append(f"Confirmed & Accepted at {apt.hospital_name}")
    
    apt.status = "ACCEPTED"
    apt.fallback_cascade_trail = json.dumps(trail)
    db.commit()
    db.refresh(apt)
    return serialize_appointment(apt)

@router.post("/{appointment_id}/escalate", response_model=AppointmentOut)
def escalate_appointment(
    appointment_id: str,
    reason: Optional[str] = Query("Capacity Overload / Specialist in Emergency"),
    db: Session = Depends(get_db)
):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Identify next available hospital
    hospitals = db.query(Hospital).all()
    current_idx = next((i for i, h in enumerate(hospitals) if h.id == apt.hospital_id), 0)
    next_hospital = hospitals[(current_idx + 1) % len(hospitals)] if hospitals else None

    if next_hospital:
        next_doc = db.query(Doctor).filter(Doctor.hospital_id == next_hospital.id).first()
        trail = json.loads(apt.fallback_cascade_trail) if apt.fallback_cascade_trail else []
        trail.append(f"Rejected at {apt.hospital_name} ({reason})")
        trail.append(f"Auto-Escalated to {next_hospital.name} (Slot Confirmed)")

        apt.hospital_id = next_hospital.id
        apt.hospital_name = next_hospital.name
        if next_doc:
            apt.doctor_id = next_doc.id
            apt.doctor_name = next_doc.name
            apt.room_no = next_doc.room_no
        apt.status = "ACCEPTED"
        apt.fallback_cascade_trail = json.dumps(trail)
    
    db.commit()
    db.refresh(apt)
    return serialize_appointment(apt)

@router.patch("/{appointment_id}/status", response_model=AppointmentOut)
def update_appointment_status(
    appointment_id: str,
    update_data: AppointmentStatusUpdate,
    db: Session = Depends(get_db)
):
    apt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not apt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    apt.status = update_data.status
    db.commit()
    db.refresh(apt)
    return serialize_appointment(apt)
