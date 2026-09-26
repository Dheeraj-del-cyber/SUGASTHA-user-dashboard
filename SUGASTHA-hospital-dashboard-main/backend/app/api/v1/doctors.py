import re
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.doctor import Doctor
from app.schemas.doctor import (
    DoctorOut, DoctorCreate, DoctorUpdate, DoctorStatusUpdate, ExtractedDoctorEntry
)

router = APIRouter()

@router.get("", response_model=List[DoctorOut])
def get_doctors(
    hospital_id: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Doctor)
    if hospital_id:
        query = query.filter(Doctor.hospital_id == hospital_id)
    if specialty and specialty != "ALL":
        query = query.filter(Doctor.specialty.ilike(f"%{specialty}%"))
    return query.all()

@router.post("", response_model=DoctorOut)
def create_doctor(doc_in: DoctorCreate, db: Session = Depends(get_db)):
    doc_id = doc_in.id or f"doc-{uuid.uuid4().hex[:6]}"
    doc = Doctor(
        id=doc_id,
        hospital_id=doc_in.hospital_id,
        name=doc_in.name,
        specialty=doc_in.specialty,
        specialty_hindi=doc_in.specialty_hindi or doc_in.specialty,
        qualification=doc_in.qualification,
        experience_years=doc_in.experience_years,
        room_no=doc_in.room_no,
        aebas_status=doc_in.aebas_status,
        aebas_check_in_time=doc_in.aebas_check_in_time,
        max_daily_slots=doc_in.max_daily_slots,
        booked_slots=doc_in.booked_slots,
        current_queue_length=doc_in.current_queue_length,
        consultation_fee=doc_in.consultation_fee,
        rating=doc_in.rating
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.put("/{doctor_id}", response_model=DoctorOut)
def update_doctor(doctor_id: str, updates: DoctorUpdate, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)

    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{doctor_id}")
def delete_doctor(doctor_id: str, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(doc)
    db.commit()
    return {"success": True, "id": doctor_id}

# --- PDF extraction ------------------------------------------------------
# Recognizes lines such as:
#   "Dr. Rajesh Sharma - Cardiology - Mon-Sat, 9:00 AM - 1:00 PM - Room 104"
#   "Dr. Priya Narang | Orthopedics | 10:00 AM - 2:00 PM"
#   "Dr. Kavita Yadav   Gynecology   Mon-Fri 9-1 PM"
_DOCTOR_LINE_RE = re.compile(
    r"(?P<name>Dr\.?\s+[A-Za-z.\'\- ]{3,60}?)\s*[-|:\u2013]\s*(?P<rest>.+)"
)
_TIME_RE = re.compile(
    r"((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[A-Za-z\-,\/ ]{0,20})?\s*"
    r"(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\s*-\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))",
    re.IGNORECASE
)
_ROOM_RE = re.compile(r"(Room\s*[\w\-]+|OPD\s*Room\s*[\w\-]+)", re.IGNORECASE)


def _parse_doctor_lines(text: str) -> List[ExtractedDoctorEntry]:
    entries: List[ExtractedDoctorEntry] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if len(line) < 5 or "dr" not in line.lower():
            continue

        match = _DOCTOR_LINE_RE.search(line)
        if not match:
            # Fallback: line starts with "Dr." but has no separator, try splitting on 2+ spaces (table-style PDFs)
            if line.lower().startswith("dr"):
                parts = re.split(r"\s{2,}|\t", line)
                if len(parts) >= 2:
                    name = parts[0].strip()
                    rest = " | ".join(p.strip() for p in parts[1:])
                else:
                    continue
            else:
                continue
        else:
            name = match.group("name").strip()
            rest = match.group("rest").strip()

        time_match = _TIME_RE.search(rest)
        timing = time_match.group(0).strip() if time_match else None

        room_match = _ROOM_RE.search(rest)
        room_no = room_match.group(0).strip() if room_match else None

        # Whatever segment isn't the timing/room is treated as the specialty
        specialty_part = rest
        if timing:
            specialty_part = specialty_part.replace(time_match.group(0), "")
        if room_no:
            specialty_part = specialty_part.replace(room_match.group(0), "")
        specialty = re.sub(r"[-|:\u2013]", " ", specialty_part).strip(" ,-|") or None

        entries.append(ExtractedDoctorEntry(
            name=name,
            specialty=specialty,
            opd_timing=timing,
            room_no=room_no,
            raw_line=line
        ))
    return entries


@router.post("/extract-pdf", response_model=List[ExtractedDoctorEntry])
async def extract_doctors_from_pdf(
    file: UploadFile = File(...),
    hospital_id: Optional[str] = Form(None),
):
    """Upload a hospital doctor-roster PDF (works for hospitals with multiple
    branches too — each branch's schedule sheet can be uploaded separately)
    and extract doctor name + OPD timing rows for review before adding them
    to the roster."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    try:
        import pdfplumber
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="PDF parsing dependency 'pdfplumber' is not installed on the server."
        )

    contents = await file.read()
    import io
    full_text_parts: List[str] = []
    try:
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                full_text_parts.append(page_text)
                # Also pull table rows in case the PDF uses a real table layout
                for table in page.extract_tables() or []:
                    for row in table:
                        cells = [c.strip() for c in row if c and c.strip()]
                        if cells:
                            full_text_parts.append(" - ".join(cells))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {e}")

    full_text = "\n".join(full_text_parts)
    entries = _parse_doctor_lines(full_text)

    if not entries:
        raise HTTPException(
            status_code=422,
            detail="No doctor/timing rows could be detected in this PDF. "
                   "Expected lines like 'Dr. Name - Specialty - 9:00 AM - 1:00 PM'."
        )

    return entries


@router.patch("/{doctor_id}/status", response_model=DoctorOut)
def update_doctor_status(doctor_id: str, status_data: DoctorStatusUpdate, db: Session = Depends(get_db)):
    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    doc.aebas_status = status_data.aebas_status
    db.commit()
    db.refresh(doc)
    return doc
